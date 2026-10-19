import { isAxiosError } from 'axios';

// Error normalizado: la UI siempre recibe un mensaje en español listo para mostrar
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null, // null = no hubo respuesta del servidor
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// La API responde los errores con el formato { error: { code, message } }
interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response) {
      const body = error.response.data?.error;
      return new ApiError(
        body?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.',
        error.response.status,
        body?.code ?? 'HTTP_ERROR',
      );
    }
    if (error.code === 'ECONNABORTED') {
      return new ApiError('El servidor tardó demasiado en responder.', null, 'TIMEOUT');
    }
    return new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexión y la URL de la API.',
      null,
      'NETWORK_ERROR',
    );
  }

  return new ApiError('Ocurrió un error inesperado.', null, 'UNKNOWN');
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}
