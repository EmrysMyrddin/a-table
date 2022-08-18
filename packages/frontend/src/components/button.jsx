import cn from "classnames";

export function Button({className, onClick, ...props}) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "border p-2 rounded",
        className,
      )}
      {...props}
    />
  )
}

export function PrimaryButton({className, ...props}) {
  return <Button className={cn("bg-blue-600 text-white hover:bg-blue-900 disabled:bg-blue-200", className)} {...props} />
}

export function SecondaryButton({className, ...props}) {
  return <Button className={cn("hover:bg-gray-100 disabled:bg-gray-300 disabled:text-white", className)} {...props} />
}

export function FloatingButton({className, ...props}) {
  return <PrimaryButton
    className={cn("aspect-square rounded-full flex items-center text-4xl absolute bottom-4 right-4 shadow-xl", className)}
    {...props}
  />
}
