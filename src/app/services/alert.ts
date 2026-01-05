import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    success( title: string, text?: string ){
        return Swal.fire({
            icon: 'success',
            title,
            text,
            confirmButtonText: 'Aceptar'
        });
    }

    error(title: string, text?: string) {
        return Swal.fire({
            icon: 'error',
            title,
            text,
            confirmButtonText: 'Aceptar'
        });
    }

    info(title: string, text?: string) {
        return Swal.fire({
            icon: 'info',
            title,
            text,
            confirmButtonText: 'Aceptar'
        });
    }

    confirm( text: string = 'Esta acción no se puede deshacer. ¿Desea continuar?'
    ) {
        return Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text,
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then( r => r.isConfirmed );
    }
}