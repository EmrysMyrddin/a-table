import {Link} from "react-router-dom";
import cn from "classnames";

export function Card({className, title, actions, ...props}) {
  return (
    <Link className={cn("block shadow-md m-4", className)} {...props} />
  )
}

function CardBody({className, children, ...props}) {
  return <div className={cn("p-2", className)} {...props}>{children}</div>
}

function CardTitle({className, children, ...props}) {
  return <div className={cn("text-xl font-bold text-center", className)} {...props}>{children}</div>
}

function CardActions({children, className, ...props}) {
  return (
    <div className={cn("flex", className)} {...props}>
      {children}
    </div>
  )
}

function CardAction({className, onClick, ...props}) {
  return (
    <button
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        onClick(e)
      }}
      className={cn("flex-1 border p-2 hover:bg-gray-100", className)}
      {...props}
    />
  )
}

Card.Action = CardAction
Card.Actions = CardActions
Card.Body = CardBody
Card.Title = CardTitle
