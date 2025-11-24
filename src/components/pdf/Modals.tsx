
'use client';
import React, { useRef, useEffect, useState } from 'react';

type ModalsProps = {
    passwordPromise: React.MutableRefObject<{ resolve: (value: string) => void; reject: (reason?: any) => void; } | null>;
}

export const Modals: React.FC<ModalsProps> = ({ passwordPromise }) => {
  const [showCacheModal, setShowCacheModal] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localStorage.getItem('cachePref')) {
      (document.getElementById('cache_modal') as HTMLDialogElement)?.showModal();
    }
  }, []);

  const handleSaveCache = () => {
    localStorage.setItem('cachePref', 'set');
    (document.getElementById('cache_modal') as HTMLDialogElement)?.close();
  };

  const handlePasswordSubmit = () => {
    if (passwordInputRef.current?.value && passwordPromise.current) {
      passwordPromise.current.resolve(passwordInputRef.current.value);
    }
  };

  const handlePasswordCancel = () => {
    if (passwordPromise.current) {
      passwordPromise.current.reject('Canceled');
    }
  };

  return (
    <>
      <dialog id="cache_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box border border-base-content/10">
          <h3 className="font-bold text-lg">Cache Settings</h3>
          <p className="py-4 text-base-content/70">This app uses browser storage to remember uploaded files for your convenience. Your data stays on your device.</p>
          <div className="modal-action">
            <button onClick={handleSaveCache} className="btn btn-primary">Got it!</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog id="password_modal" className="modal">
        <div className="modal-box border border-error/20">
          <h3 className="font-bold text-lg text-error">Password Protected</h3>
          <p className="py-4">Enter password to unlock PDF:</p>
          <input type="password" ref={passwordInputRef} placeholder="Password" className="input input-bordered input-error w-full mb-4" />
          <div className="modal-action">
            <button onClick={handlePasswordCancel} className="btn btn-ghost">Cancel</button>
            <button onClick={handlePasswordSubmit} className="btn btn-error">Unlock</button>
          </div>
        </div>
      </dialog>
    </>
  );
};
