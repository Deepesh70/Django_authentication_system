import { reactive } from 'vue';

const toasts = reactive([])
let toastId = 0

function showToast(message, type='info', duration= 4000){
    const id = ++toastId
    toasts.push({id, message, type, leaving: false})

    setTimeout(() => {
        dismissToast(id)
    }, duration)
}

function dismissToast(id){
    const toast = toasts.find((t) => t.id === id )
    if(toast) {
        toast.leaving = true
        setTimeout(() => {
            const index  = toasts.findIndex((t) => t.id === id)
            if(index > -1){
                toasts.splice(index, 1)
            }
        },300)
    }
}

export function useToast() {
    return{
        toasts,
        showToast, 
        dismissToast
    }
}