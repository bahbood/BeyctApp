// app/(newsPaper)/(AgenciesManagement)/action/newsAgencyProfileAction.ts

'use server'

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { newsAgencies } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  deleteNewsAgencyImageFile,
  MAX_BANNER_SIZE,
  MAX_LOGO_SIZE,
  saveNewsAgencyImage,
  NewsAgencyImageError,
} from '../lib/newsAgencyImagesDb'

export type NewsAgencyProfileState = {
  success: boolean
  errors?: {
    news_agency_about?: string
    news_agency_address?: string
    news_agency_tell?: string
    news_agency_mobile?: string
    news_agency_email?: string
    news_agency_logo?: string
    news_agency_header_banner?: string
    message?: string
  }
  values?: Record<string, string | null>
} | null

const TEL_REGEX = /^\d{11}$/
const MOBILE_REGEX = /^\d{11}$/
const EMAIL_REGEX = /^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$/

function revalidateProfilePaths() {
  revalidatePath('/newsAgencyProfile')
  revalidatePath('/myNewsAgency')
  revalidatePath('/news')
}

/**
 * ذخیره پروفایل خبرگزاری (اطلاعات تماس، توضیحات و تصاویر)
 * لوگو باید مربع باشد : برای اطمینان از شکل ۱:۱، در تولید تصویر بهتر است سمت سرور
 * برش انجام شود، اما در این پروژه صرفاً محدودیت حجم و فرمت اعمال می‌شود.
 */
export async function saveNewsAgencyProfileAction(
  prevState: NewsAgencyProfileState,
  formData: FormData,
): Promise<NewsAgencyProfileState> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, errors: { message: 'نشست نامعتبر است' } }
  }

  const [agency] = await db.select().from(newsAgencies).where(eq(newsAgencies.user_id, userId)).limit(1)

  if (!agency) {
    return { success: false, errors: { message: 'خبرگزاری برای این کاربر یافت نشد' } }
  }

  const news_agency_about = ((formData.get('news_agency_about') as string) || '').trim()
  const news_agency_address = ((formData.get('news_agency_address') as string) || '').trim()
  const news_agency_tell = ((formData.get('news_agency_tell') as string) || '').trim()
  const news_agency_mobile = ((formData.get('news_agency_mobile') as string) || '').trim()
  const news_agency_email = ((formData.get('news_agency_email') as string) || '').trim().toLowerCase()

  const logoFile = formData.get('news_agency_logo') as File | null
  const bannerFile = formData.get('news_agency_header_banner') as File | null

  const removeLogo = formData.get('remove_news_agency_logo') === 'on'
  const removeBanner = formData.get('remove_news_agency_header_banner') === 'on'

  const errors: NonNullable<NewsAgencyProfileState>['errors'] = {}

  if (news_agency_tell && !TEL_REGEX.test(news_agency_tell)) {
    errors.news_agency_tell = 'شماره تلفن باید ۱۱ رقمی باشد'
  }
  if (news_agency_mobile && !MOBILE_REGEX.test(news_agency_mobile)) {
    errors.news_agency_mobile = 'شماره موبایل باید ۱۱ رقمی باشد'
  }
  if (news_agency_email && !EMAIL_REGEX.test(news_agency_email)) {
    errors.news_agency_email = 'آدرس ایمیل نامعتبر است'
  }
  if (news_agency_about.length > 5000) {
    errors.news_agency_about = 'متن درباره خبرگزاری بیش از حد طولانی است'
  }
  if (news_agency_address.length > 250) {
    errors.news_agency_address = 'آدرس حداکثر ۲۵۰ کاراکتر'
  }

  if (logoFile && logoFile.size > 0 && logoFile.size > MAX_LOGO_SIZE) {
    errors.news_agency_logo = `حجم لوگو بیش از حد مجاز است. حداکثر: ${Math.round(MAX_LOGO_SIZE / 1024)}KB`
  }
  if (bannerFile && bannerFile.size > 0 && bannerFile.size > MAX_BANNER_SIZE) {
    errors.news_agency_header_banner = `حجم بنر بیش از حد مجاز است. حداکثر: ${Math.round(MAX_BANNER_SIZE / 1024)}KB`
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      values: {
        news_agency_about,
        news_agency_address,
        news_agency_tell,
        news_agency_mobile,
        news_agency_email,
      },
    }
  }

  let newLogo: string | null | undefined = agency.news_agency_logo
  let newBanner: string | null | undefined = agency.news_agency_header_banner

  try {
    if (removeLogo && agency.news_agency_logo) {
      await deleteNewsAgencyImageFile(agency.news_agency_logo)
      newLogo = null
    }

    if (logoFile && logoFile.size > 0) {
      if (agency.news_agency_logo) {
        await deleteNewsAgencyImageFile(agency.news_agency_logo)
      }
      newLogo = await saveNewsAgencyImage(logoFile, 'logo', agency.id)
    }

    if (removeBanner && agency.news_agency_header_banner) {
      await deleteNewsAgencyImageFile(agency.news_agency_header_banner)
      newBanner = null
    }

    if (bannerFile && bannerFile.size > 0) {
      if (agency.news_agency_header_banner) {
        await deleteNewsAgencyImageFile(agency.news_agency_header_banner)
      }
      newBanner = await saveNewsAgencyImage(bannerFile, 'banner', agency.id)
    }

    await db
      .update(newsAgencies)
      .set({
        news_agency_about: news_agency_about || null,
        news_agency_address: news_agency_address || null,
        news_agency_tell: news_agency_tell || null,
        news_agency_mobile: news_agency_mobile || null,
        news_agency_email: news_agency_email || null,
        news_agency_logo: newLogo,
        news_agency_header_banner: newBanner,
      })
      .where(eq(newsAgencies.id, agency.id))

    revalidateProfilePaths()

    return { success: true }
  } catch (error) {
    console.error('Save news agency profile error:', error)

    if (error instanceof NewsAgencyImageError) {
      return {
        success: false,
        errors: { news_agency_logo: error.message, news_agency_header_banner: error.message },
      }
    }

    return { success: false, errors: { message: 'خطا در ذخیره پروفایل خبرگزاری' } }
  }
}