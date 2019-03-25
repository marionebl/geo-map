import * as Types from '../types';

export function loadScript(
  src: string,
  data: { [key: string]: string },
  context: Types.LoadMapContext
): Promise<Types.Result<void>> {
  const {
    window: { document }
  } = context;

  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;

    Object.keys(data).map(key => script.setAttribute(`data-${key}`, data[key]));

    function onLoad(event: Event): void {
      resolve({ type: Types.ResultType.Success, payload: undefined });
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    }

    function onError(event: Event): void {
      resolve({
        type: Types.ResultType.Failure,
        error: new Error(`Could not load ${src}: ${event}`)
      });
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    }

    script.addEventListener('error', onError);
    script.addEventListener('load', onLoad);

    document.body.appendChild(script);
  });
}
