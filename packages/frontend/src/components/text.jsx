import cn from "classnames";

export function Small({className, ...props}) {
  return <small className={cn('text-gray-400', className)} {...props} />
}
