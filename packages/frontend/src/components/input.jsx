import cn from 'classnames'

export function Input({className, ...props}) {
  return <input className={cn("border rounded p-2 mb-4 w-full", className)} {...props} />
}

export function Select({className, ...props}) {
  return <select className={cn("border rounded p-2.5 mb-4 w-full bg-white text-md", className)} {...props} />
}
