// app/(Auth)/components/action/ActiveStoreAction.ts



export type ActiveStoreState = {
  success: boolean
  errors?:{
   
 }
 
 } | null

 

export async function ActiveStoreAction(prevState: ActiveStoreState, formData: FormData): Promise<ActiveStoreState> {
    return {success:true}
}