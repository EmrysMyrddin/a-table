import {useNavigate} from "react-router-dom";
import {useMutation} from "urql";
import {Input} from "../components/input";
import {AuthScreen} from "../components/auth-screen";

export function LoginScreen() {
  const navigate = useNavigate();
  const [{fetching, data, error}, login] = useMutation(/* GraphQL */ `
    mutation login($username: String!, $password: String!) {
      login(args: {username_input: $username, password_input: $password}) {
        token
      }
    }
  `)
  
  
  return (
    <AuthScreen
      onSubmit={async form => {
        const result = await login({username: form.username.value, password: form.password.value})
        if (result?.data?.login?.token) {
          localStorage.setItem("token", result?.data?.login?.token)
          navigate("/babies/")
        }
      }}
    >
      <AuthScreen.Title>Login</AuthScreen.Title>
      <Input name="username" placeholder="Utilisateur" required/>
      <Input name="password" type="password" placeholder="Mot de passe" required/>
      <AuthScreen.Error visible={(data && !data?.login?.token) || error}>{error?.message || 'Mauvais utilisateur ou mot de passe'}</AuthScreen.Error>
      <AuthScreen.Link to="/register" >Pas encore inscrit ?</AuthScreen.Link>
      <AuthScreen.Actions okText="Se connecter" fetching={fetching}/>
    </AuthScreen>
  )
}
