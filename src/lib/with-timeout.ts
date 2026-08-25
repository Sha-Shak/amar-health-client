// Guards a promise that talks to a browser API with no reliable timeout of its
// own (image decode, device media) so a stuck one degrades to an error instead
// of leaving the UI stuck on a spinner forever.
export function withTimeout<T>(promise: Promise<T>, ms: number, message = "Timed out"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}
