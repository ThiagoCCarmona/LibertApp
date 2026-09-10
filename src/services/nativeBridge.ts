/**
 * Ponte de comunicacao bidirecional com o backend C# (.NET MAUI HybridWebView).
 * Se o app estiver rodando fora do MAUI (navegador comum), opera com fallback seguro.
 */

export interface BridgeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  callbackId?: string;
}

type CallbackFn = (response: BridgeResponse) => void;
const pendingCallbacks = new Map<string, CallbackFn>();

// Listener global para respostas vindas do C# via HybridWebView
if (typeof window !== 'undefined') {
  (window as any).__onNativeBridgeResponse = (response: BridgeResponse) => {
    if (response.callbackId && pendingCallbacks.has(response.callbackId)) {
      const callback = pendingCallbacks.get(response.callbackId);
      pendingCallbacks.delete(response.callbackId);
      callback?.(response);
    }
  };
}

/**
 * Verifica se a aplicacao esta rodando dentro da casca .NET MAUI
 */
export function isMauiHybrid(): boolean {
  return typeof window !== 'undefined' && !!(window as any).HybridWebView;
}

/**
 * Envia uma mensagem com acao e payload tipado para o backend C#
 */
export async function sendNativeMessage<T = any>(action: string, payload?: any): Promise<T | null> {
  const callbackId = cb__;

  if (isMauiHybrid()) {
    return new Promise((resolve, reject) => {
      pendingCallbacks.set(callbackId, (response) => {
        if (response.success) {
          resolve(response.data as T);
        } else {
          console.warn([NativeBridge Error] );
          reject(new Error(response.error || 'Erro nativo'));
        }
      });

      const message = JSON.stringify({
        action,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload ?? {}),
        callbackId,
      });

      try {
        (window as any).HybridWebView.SendRawMessage(message);
      } catch (err) {
        pendingCallbacks.delete(callbackId);
        reject(err);
      }
    });
  }

  // Fallback de desenvolvimento no navegador
  return null;
}
