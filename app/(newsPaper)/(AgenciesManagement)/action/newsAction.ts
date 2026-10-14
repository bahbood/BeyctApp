// app/(newsPaper)/(AgenciesManagement)/action/newsAction.ts

'use server'

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { news, newsImages, newsLikes } from '@/app/db/schema'
import { and, count, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { jalaaliInputToDate } from '@/app/lib/jalaliDate'
import {
  deleteNewsImageFile,
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_NEWS,
  MAX_TOTAL_IMAGE_SIZE,
  saveNewsImage,
  NewsImageError,
} from '../lib/newsImagesDb'
import { getNewsAgencyByUserId } from '@/app/(newsPaper)/lib/getNewsAgencyByUserId'
import { isNewsAgencyPublishable } from '../lib/newsAgencySubscription'

export type NewsFormState = {
  success: boolean
  errors?: {
    headline?: string
    sub_headline?: string
    body?: string
    published_at?: string
    archive_at?: string
    news_category?: string
    news_source?: string
    reporter?: string
    images?: string
    message?: string
  }
  values?: Record<string, string | null>
} | null

export type NewsDeleteState = {
  success: boolean
  errors?: {
    message?: string
  }
} | null

export type NewsLikeState = {
  success: boolean
  liked?: boolean
  likeCount?: number
  errors?: {
    message?: string
  }
} | null

export type NewsToggleState = {
  success: boolean
  message?: string
} | null

function revalidateNewsPaths() {
  revalidatePath('/newsList')
  revalidatePath('/myNewsAgency')
  revalidatePath('/news')
}

const MAX_FILE_SIZE_KB = Math.round(MAX_FILE_SIZE / 1024)

function dateDayValue(date: Date): number {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day.getTime()
}

function validateImages(images: (File | null)[], existingCount = 0): string | null {
  let total = existingCount
  let totalBytes = 0
  for (const file of images) {
    if (file && file.size > 0) {
      total++
      totalBytes += file.size
      if (totalBytes > MAX_TOTAL_IMAGE_SIZE) {
        return `حجم مجموع تصاویر ارسالی بیش از حد مجاز است. حداکثر: ${Math.round(MAX_TOTAL_IMAGE_SIZE / 1024)} KB`
      }
      if (total > MAX_IMAGES_PER_NEWS) {
        return `حداکثر ${MAX_IMAGES_PER_NEWS} تصویر برای هر خبر مجاز است`
      }
      if (file.size > MAX_FILE_SIZE) {
        return `حجم هر تصویر بیش از حد مجاز است. حداکثر: ${MAX_FILE_SIZE_KB} KB`
      }
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !['jpg','jpeg','png','gif','webp'].includes(ext)) {
        return 'فرمت تصویر مجاز نیست (jpg, jpeg, png, gif, webp)'
      }
    }
  }
  return null
}

export async function createNewsAction(
  prevState: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, errors: { message: 'نشست نامعتبر است' } }

  const agency = await getNewsAgencyByUserId(userId)
  if (!agency) return { success: false, errors: { message: 'خبرگزاری برای این کاربر یافت نشد' } }

  // لایه دفاعی سمت سرور : خبرگزاری بدون اجازه انتشار نمی تواند خبر ثبت کند
  if (!isNewsAgencyPublishable(agency)) {
    return {
      success: false,
      errors: { message: 'خبرگزاری شما در وضعیت انتشار مجاز نیست. اشتراک یا وضعیت خود را بررسی کنید.' },
    }
  }

  const headline = ((formData.get('headline') as string) || '').trim()
  const sub_headline = ((formData.get('sub_headline') as string) || '').trim()
  const body = ((formData.get('body') as string) || '').trim()
  const published_at_input = ((formData.get('published_at') as string) || '').trim()
  const archive_at_input = ((formData.get('archive_at') as string) || '').trim()
  const news_category = ((formData.get('news_category') as string) || '').trim()
  const news_source = ((formData.get('news_source') as string) || '').trim()
  const reporter = ((formData.get('reporter') as string) || '').trim()
  const on_air = formData.get('on_air') === 'on'
  const is_breaking = formData.get('is_breaking') === 'on'
  const comments_enabled = formData.get('comments_enabled') === 'on'
  const errors: NonNullable<NewsFormState>['errors'] = {}
  if (headline.length < 1) errors.headline = 'تیتر خبر الزامی است'
  if (headline.length > 200) errors.headline = 'تیتر خبر حداکثر ۲۰۰ کاراکتر'
  if (sub_headline.length > 200) errors.sub_headline = 'زیرتیتر خبر حداکثر ۲۰۰ کاراکتر'
  if (body.length < 1) errors.body = 'متن خبر الزامی است'
  if (news_category.length > 50) errors.news_category = 'دسته‌بندی حداکثر ۵۰ کاراکتر'
  if (news_source.length > 100) errors.news_source = 'منبع خبر حداکثر ۱۰۰ کاراکتر'
  if (reporter.length > 150) errors.reporter = 'نام خبرنگار حداکثر ۱۵۰ کاراکتر'
  const publishedAt = published_at_input ? jalaaliInputToDate(published_at_input) : new Date()
  if (published_at_input && !publishedAt) errors.published_at = 'تاریخ انتشار نامعتبر است (YYYY/MM/DD)'
  const archiveAt = archive_at_input ? jalaaliInputToDate(archive_at_input) : null
  if (archive_at_input && !archiveAt) errors.archive_at = 'تاریخ بایگانی نامعتبر است (YYYY/MM/DD)'
  if (archiveAt && publishedAt && dateDayValue(archiveAt) < dateDayValue(publishedAt)) {
    errors.archive_at = 'تاریخ بایگانی نمی‌تواند قبل از تاریخ انتشار باشد'
  }
  const imageFiles: (File | null)[] = []
  for (let i = 0; i < MAX_IMAGES_PER_NEWS; i++) {
    imageFiles.push(formData.get(`images_${i}`) as File | null)
  }
  const imgErr = validateImages(imageFiles, 0)
  if (imgErr) errors.images = imgErr
  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values: { headline, sub_headline, body, published_at: published_at_input, archive_at: archive_at_input, news_category, news_source, reporter } }
  }

  const savedImages: { name: string; position: number }[] = []

  try {
    // ابتدا فایل‌ها ذخیره و اعتبارسنجی می‌شوند؛ سپس خبر و رکوردهای تصاویر در یک تراکنش ثبت می‌شوند.
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      if (file && file.size > 0) {
        savedImages.push({ name: await saveNewsImage(file, userId), position: i })
      }
    }

    await db.transaction(async (tx) => {
      const [newRow] = await tx.insert(news).values({
        headline,
        sub_headline: sub_headline || null,
        body,
        news_category: news_category || null,
        news_source: news_source || null,
        reporter: reporter || null,
        on_air,
        is_breaking,
        comments_enabled,
        published_at: publishedAt ?? new Date(),
        archive_at: archiveAt,
        news_agency_id: agency.id,
      }).returning({ id: news.id })

      if (savedImages.length > 0) {
        await tx.insert(newsImages).values(
          savedImages.map(({ name, position }) => ({
            image_name: name,
            position,
            news_id: newRow.id,
          })),
        )
      }
    })

    revalidateNewsPaths()
    return { success: true }
  } catch (error) {
    console.error('Create news error:', error)
    for (const image of savedImages) await deleteNewsImageFile(image.name)
    if (error instanceof NewsImageError) return { success: false, errors: { images: error.message } }
    return { success: false, errors: { message: 'خطا در ثبت خبر' } }
  }
}


export async function editNewsAction(
  newsId: number,
  prevState: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, errors: { message: 'نشست نامعتبر است' } }

  const agency = await getNewsAgencyByUserId(userId)
  if (!agency) return { success: false, errors: { message: 'دسترسی مجاز نیست' } }

  const [current] = await db
    .select()
    .from(news)
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .limit(1)

  if (!current) return { success: false, errors: { message: 'خبر یافت نشد یا اجازه ویرایش آن را ندارید' } }

  const headline = ((formData.get('headline') as string) || '').trim()
  const sub_headline = ((formData.get('sub_headline') as string) || '').trim()
  const body = ((formData.get('body') as string) || '').trim()
  const published_at_input = ((formData.get('published_at') as string) || '').trim()
  const archive_at_input = ((formData.get('archive_at') as string) || '').trim()
  const news_category = ((formData.get('news_category') as string) || '').trim()
  const news_source = ((formData.get('news_source') as string) || '').trim()
  const reporter = ((formData.get('reporter') as string) || '').trim()
  const expectedUpdatedAtInput = ((formData.get('expected_updated_at') as string) || '').trim()
  const expectedUpdatedAt = expectedUpdatedAtInput ? new Date(expectedUpdatedAtInput) : null
  const requestedOnAir = formData.get('on_air') === 'on'
  const is_breaking = formData.get('is_breaking') === 'on'
  const comments_enabled = formData.get('comments_enabled') === 'on'
  const errors: NonNullable<NewsFormState>['errors'] = {}

  if (headline.length < 1) errors.headline = 'تیتر خبر الزامی است'
  if (headline.length > 200) errors.headline = 'تیتر خبر حداکثر ۲۰۰ کاراکتر'
  if (sub_headline.length > 200) errors.sub_headline = 'زیرتیتر خبر حداکثر ۲۰۰ کاراکتر'
  if (body.length < 1) errors.body = 'متن خبر الزامی است'
  if (news_category.length > 50) errors.news_category = 'دسته‌بندی حداکثر ۵۰ کاراکتر'
  if (news_source.length > 100) errors.news_source = 'منبع خبر حداکثر ۱۰۰ کاراکتر'
  if (reporter.length > 150) errors.reporter = 'نام خبرنگار حداکثر ۱۵۰ کاراکتر'

  const publishedAt = published_at_input ? jalaaliInputToDate(published_at_input) : current.published_at
  if (published_at_input && !publishedAt) errors.published_at = 'تاریخ انتشار نامعتبر است (YYYY/MM/DD)'
  const archiveAt = archive_at_input ? jalaaliInputToDate(archive_at_input) : null
  if (archive_at_input && !archiveAt) errors.archive_at = 'تاریخ بایگانی نامعتبر است (YYYY/MM/DD)'
  if (archiveAt && publishedAt && dateDayValue(archiveAt) < dateDayValue(publishedAt)) {
    errors.archive_at = 'تاریخ بایگانی نمی‌تواند قبل از تاریخ انتشار باشد'
  }
  if (
    !expectedUpdatedAt ||
    Number.isNaN(expectedUpdatedAt.getTime()) ||
    expectedUpdatedAt.getTime() !== current.updated_at.getTime()
  ) {
    errors.message = 'این خبر پس از باز شدن فرم تغییر کرده است. صفحه را تازه‌سازی کنید و تغییرات را دوباره اعمال کنید.'
  }

  const imageFiles: (File | null)[] = []
  for (let i = 0; i < MAX_IMAGES_PER_NEWS; i++) {
    imageFiles.push(formData.get(`images_${i}`) as File | null)
  }

  const allImages = await db
    .select({ id: newsImages.id, image_name: newsImages.image_name, position: newsImages.position })
    .from(newsImages)
    .where(eq(newsImages.news_id, newsId))
    .orderBy(newsImages.position)

  const requestedRemovalIds = [...new Set(
    formData.getAll('remove_image_ids')
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0),
  )]
  const removableImages = allImages.filter((image) => requestedRemovalIds.includes(image.id))
  if (removableImages.length !== requestedRemovalIds.length) {
    errors.images = 'فهرست تصاویر برای حذف معتبر نیست'
  }

  const remainingCount = allImages.length - removableImages.length
  const imgErr = validateImages(imageFiles, remainingCount)
  if (imgErr) errors.images = imgErr

  // خبر موجودی که از قبل منتشر بوده قابل ویرایش است؛ ولی اشتراک نامعتبر نباید
  // امکان روشن کردن انتشار برای خبری که خاموش بوده را ایجاد کند.
  if (requestedOnAir && !current.on_air && !isNewsAgencyPublishable(agency)) {
    errors.message = 'خبرگزاری شما در وضعیت انتشار مجاز نیست؛ ابتدا وضعیت اشتراک را بررسی کنید.'
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      values: {
        headline, sub_headline, body,
        published_at: published_at_input,
        archive_at: archive_at_input,
        news_category, news_source, reporter,
      },
    }
  }

  const finalOnAir = current.on_air ? requestedOnAir : requestedOnAir && isNewsAgencyPublishable(agency)
  const savedImageNames: string[] = []

  try {
    for (const file of imageFiles) {
      if (file && file.size > 0) savedImageNames.push(await saveNewsImage(file, userId))
    }

    const removedIds = removableImages.map((image) => image.id)
    const usedPositions = new Set(
      allImages.filter((image) => !removedIds.includes(image.id)).map((image) => image.position),
    )
    const freePositions = Array.from({ length: MAX_IMAGES_PER_NEWS }, (_, index) => index)
      .filter((position) => !usedPositions.has(position))

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(news)
        .set({
          headline,
          sub_headline: sub_headline || null,
          body,
          news_category: news_category || null,
          news_source: news_source || null,
          reporter: reporter || null,
          published_at: publishedAt ?? current.published_at,
          archive_at: archiveAt,
          on_air: finalOnAir,
          is_breaking,
          comments_enabled,
          updated_at: new Date(),
        })
        .where(and(
          eq(news.id, newsId),
          eq(news.news_agency_id, agency.id),
          eq(news.updated_at, current.updated_at),
        ))
        .returning({ id: news.id })

      if (updated.length === 0) throw new Error('NEWS_CONFLICT')

      if (removedIds.length > 0) {
        await tx.delete(newsImages).where(
          and(eq(newsImages.news_id, newsId), inArray(newsImages.id, removedIds)),
        )
      }

      for (let index = 0; index < savedImageNames.length; index++) {
        await tx.insert(newsImages).values({
          image_name: savedImageNames[index],
          position: freePositions[index],
          news_id: newsId,
        })
      }
    })

    for (const image of removableImages) await deleteNewsImageFile(image.image_name)

    revalidateNewsPaths()
    revalidatePath(`/news/${newsId}`)
    return { success: true }
  } catch (error) {
    console.error('Edit news error:', error)
    for (const name of savedImageNames) await deleteNewsImageFile(name)
    if (error instanceof NewsImageError) return { success: false, errors: { images: error.message } }
    if (error instanceof Error && error.message === 'NEWS_CONFLICT') {
      return { success: false, errors: { message: 'خبر هم‌زمان در جای دیگری تغییر کرده است. صفحه را تازه‌سازی کنید و دوباره تلاش کنید.' } }
    }
    if (error instanceof Error && error.message === 'NEWS_NOT_FOUND') {
      return { success: false, errors: { message: 'خبر یافت نشد یا اجازه ویرایش آن را ندارید' } }
    }
    return { success: false, errors: { message: 'خطا در ویرایش خبر' } }
  }
}

export async function toggleNewsOnAirAction(newsId: number): Promise<NewsToggleState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, message: 'نشست نامعتبر است' }

  const agency = await getNewsAgencyByUserId(userId)
  if (!agency) return { success: false, message: 'دسترسی مجاز نیست' }

  const [row] = await db
    .select({ id: news.id, on_air: news.on_air })
    .from(news)
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .limit(1)
  if (!row) return { success: false, message: 'خبر یافت نشد' }

  const nextValue = !row.on_air

  // فقط روشن کردن انتشار نیاز به اجازه انتشار دارد؛ خاموش کردن همیشه مجاز است
  if (nextValue && !isNewsAgencyPublishable(agency)) {
    return { success: false, message: 'خبرگزاری شما مجاز به انتشار خبر نیست' }
  }

  // شرط مالکیت داخل خود UPDATE است تا بررسی-سپس-نوشتن (TOCTOU) حذف شود
  const updated = await db
    .update(news)
    .set({ on_air: nextValue, updated_at: new Date() })
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .returning({ id: news.id })

  if (updated.length === 0) return { success: false, message: 'خبر یافت نشد' }

  revalidateNewsPaths()
  return { success: true }
}

export async function toggleNewsBreakingAction(newsId: number): Promise<NewsToggleState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, message: 'نشست نامعتبر است' }

  const agency = await getNewsAgencyByUserId(userId)
  if (!agency) return { success: false, message: 'دسترسی مجاز نیست' }

  const [row] = await db
    .select({ id: news.id, is_breaking: news.is_breaking })
    .from(news)
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .limit(1)
  if (!row) return { success: false, message: 'خبر یافت نشد' }

  const updated = await db
    .update(news)
    .set({ is_breaking: !row.is_breaking, updated_at: new Date() })
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .returning({ id: news.id })

  if (updated.length === 0) return { success: false, message: 'خبر یافت نشد' }

  revalidateNewsPaths()
  return { success: true }
}

export async function toggleNewsCommentsAction(newsId: number): Promise<NewsToggleState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, message: 'نشست نامعتبر است' }

  const agency = await getNewsAgencyByUserId(userId)
  if (!agency) return { success: false, message: 'دسترسی مجاز نیست' }

  const [row] = await db
    .select({ id: news.id, comments_enabled: news.comments_enabled })
    .from(news)
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .limit(1)
  if (!row) return { success: false, message: 'خبر یافت نشد' }

  const updated = await db
    .update(news)
    .set({ comments_enabled: !row.comments_enabled, updated_at: new Date() })
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .returning({ id: news.id })

  if (updated.length === 0) return { success: false, message: 'خبر یافت نشد' }

  revalidateNewsPaths()
  return { success: true }
}

export async function deleteNewsAction(newsId: number): Promise<NewsDeleteState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, errors: { message: 'نشست نامعتبر است' } }

  const agency = await getNewsAgencyByUserId(userId)
  if (!agency) return { success: false, errors: { message: 'دسترسی مجاز نیست' } }

  const images = await db
    .select({ image_name: newsImages.image_name })
    .from(newsImages)
    .innerJoin(news, eq(newsImages.news_id, news.id))
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))

  // شرط مالکیت داخل خود DELETE است؛ اگر مالک نباشد هیچ ردیفی حذف نمی شود
  const deleted = await db
    .delete(news)
    .where(and(eq(news.id, newsId), eq(news.news_agency_id, agency.id)))
    .returning({ id: news.id })

  if (deleted.length === 0) return { success: false, errors: { message: 'خبر یافت نشد' } }

  for (const img of images) await deleteNewsImageFile(img.image_name)

  revalidateNewsPaths()
  return { success: true }
}

export async function toggleNewsLikeAction(newsId: number): Promise<NewsLikeState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id
  if (!userId) return { success: false, errors: { message: 'برای پسندیدن باید وارد سایت شوید' } }

  const [target] = await db.select({ id: news.id }).from(news).where(eq(news.id, newsId)).limit(1)
  if (!target) return { success: false, errors: { message: 'خبر یافت نشد' } }

  // اول تلاش برای حذف؛ اگر چیزی حذف نشد یعنی قبلا پسندیده نشده بود → افزودن
  const removed = await db
    .delete(newsLikes)
    .where(and(eq(newsLikes.news_id, newsId), eq(newsLikes.user_id, userId)))
    .returning({ id: newsLikes.id })

  const liked = removed.length === 0

  if (liked) {
    // تکرار همزمان دو تب باعث خطای یکتایی نمی شود
    await db
      .insert(newsLikes)
      .values({ news_id: newsId, user_id: userId })
      .onConflictDoNothing()
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(newsLikes)
    .where(eq(newsLikes.news_id, newsId))

  return { success: true, liked, likeCount: total ?? 0 }
}
