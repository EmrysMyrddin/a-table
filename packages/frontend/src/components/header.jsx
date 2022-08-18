import cn from "classnames";

export function Header({className, ...props}) {
  return <h1 className={cn("text-xl border p-4", className)} {...props} />
}
