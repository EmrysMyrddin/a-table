import {PrimaryButton, SecondaryButton} from "./button";
import {useState} from "react";
import cn from "classnames";

export function Modal({children, onCloseRequested, onSubmit, okLabel, loading, title, disabled}) {
  const [closing, setClosing] = useState(false);
  function close() {
    setClosing(true)
    setTimeout(onCloseRequested, 300);
  }
  
  return (
    <div
      onClick={() => close()}
      className={cn(
        "fixed inset-0 z-10 flex justify-center items-start bg-gray-900 bg-opacity-50 animate-fadeIn overflow-auto",
        { 'animate-fadeOut': closing },
      )}
    >
      <form
        onClick={e => e.stopPropagation()}
        className={cn(
          "bg-white shadow-lg rounded-lg  mt-16 w-11/12 animate-slideDown p-4 mb-4",
          { 'animate-slideUp': closing }
        )}
        onSubmit={async e => {
          e.preventDefault();
          onSubmit(e.target, close);
        }}
      >
        <h2 className="text-lg mb-4">{title}</h2>
        <div className="">
          {children}
          <div className="flex justify-end gap-4">
            <SecondaryButton type="reset" disabled={loading} onClick={() => close()}>Annuler</SecondaryButton>
            <PrimaryButton type="submit" disabled={loading | disabled}>{okLabel}</PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  )
}
