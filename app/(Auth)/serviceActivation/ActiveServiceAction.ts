// app/(Auth)/components/action/ActiveServiceAction.ts




export type ActiveServiceState = {
  success: boolean
  errors?:{
   
 }
 
 } | null

 

export async function ActiveServiceAction(prevState: ActiveServiceState, formData: FormData): Promise<ActiveServiceState> {
    return {success:true}
}