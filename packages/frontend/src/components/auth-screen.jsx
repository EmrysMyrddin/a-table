import cn from "classnames";
import {PrimaryButton, SecondaryButton} from "./button";
import {Link} from "react-router-dom";

export function AuthScreen({children, onSubmit}) {
  return (
    <div className="h-screen flex items-center justify-start bg-gray-50 p-5 pt-20 flex-col gap-10">
      <h1 className="text-2xl">Baby Tracker</h1>
      <form className="shadow mt-10 p-2 bg-white max-w-md" onSubmit={e => {
        e.preventDefault()
        onSubmit(e.target)
      }}>
        {children}
      </form>
    </div>
  )
}

function AuthTitle({children}) {
  return <h2 className="text-center p-2 text-lg">{children}</h2>
}

function AuthError({visible, children}) {
  return (
    <div className={cn('text-red-500 pb-2', visible ? 'visible' : 'invisible')}>
      {children}
    </div>
  )
}

function AuthActions({okText, fetching}) {
  return (
    <div className="flex justify-end gap-2 items-center">
      <SecondaryButton type="reset" disabled={fetching}>Annuler</SecondaryButton>
      <PrimaryButton type="submit" disabled={fetching}>{okText}</PrimaryButton>
    </div>
  )
}

function AuthLink({className, ...props}) {
  return <Link className={cn("text-blue-500", className)} {...props} />
}

AuthScreen.Title = AuthTitle
AuthScreen.Error = AuthError
AuthScreen.Actions = AuthActions
AuthScreen.Link = AuthLink
