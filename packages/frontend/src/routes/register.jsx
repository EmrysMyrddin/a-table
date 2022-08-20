import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {useMutation} from "urql";
import {toast} from "react-toastify";
import {Input} from "../components/input";
import {AuthActions, AuthError, AuthScreen, AuthTitle} from "../components/auth-screen";

export function RegisterScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState(null)
  const [{fetching}, register] = useMutation(/* GraphQL */ `
    mutation register($username: String!, $password: String!) {
      register_user(args: { username: $username, password: $password}) {
        token
      }
    }
  `)
  
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/babies/")
  }, [])
  
  return (
    <AuthScreen
      onSubmit={async form => {
      setError(null)
      if (form.password.value !== form.passwordConfirm.value) {
        setError("Les mots de passe ne correspondent pas.")
        return
      }
      
      const result = await register({username: form.username.value, password: form.password.value})
      if (!result?.data?.register_user?.token) {
        setError("Ce nom d'utilisateur n'est pas disponible")
        return
      }
      
      localStorage.setItem("token", result?.data?.register_user?.token)
      navigate("/babies/")
      toast.success(`Bienvenue ${form.username.value} !`)
    }}>
      <AuthScreen.Title>Inscription</AuthScreen.Title>
      <Input name="username" placeholder="Utilisateur" required/>
      <Input name="password" type="password" placeholder="Mot de passe" required/>
      <Input name="passwordConfirm" type="password" placeholder="Confirmation du mot de passe" required/>
      <AuthScreen.Error visible={error}>{error ?? 'error'}</AuthScreen.Error>
      <AuthScreen.Link to="/login" >Déjà inscrit ?</AuthScreen.Link>
      <AuthScreen.Actions okText="S'inscricre" fetching={fetching}/>
    </AuthScreen>
  )
}
