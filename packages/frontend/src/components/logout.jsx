import {SecondaryButton} from "./button";
import {useNavigate} from "react-router-dom";
import { ReactComponent as LougoutIcon} from './icons/logout-circle-svgrepo-com.svg';
import cn from "classnames";

export function LogoutButton({className, ...props}) {
  const navigate = useNavigate();

  return (
    <SecondaryButton
      className={cn("text-sm rounded-full", className)}
      onClick={() => {
        localStorage.removeItem("token")
        navigate("/login")
      }}
      {...props}>
      <LougoutIcon />
    </SecondaryButton>
  )
}
