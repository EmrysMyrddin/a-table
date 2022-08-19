import {useCurrentUser} from "../components/auth-provider";
import {useNavigate, useParams} from "react-router-dom";
import {useMutation, useQuery} from "urql";
import {PrimaryButton, SecondaryButton} from "../components/button";
import {Modal} from "../components/modal";
import {Small} from "../components/text";
import {toast} from "react-toastify";

export function ShareScreen() {
  const navigate = useNavigate()
  const { shareTo } = useParams()
  const [{fetching}, share] = useMutation(SHARE_MUTATION)
  
  return (
    <div className="flex flex-col justify-center items-center gap-4 p-4">
      <p>
        Acceptez-vous de partager  l'accès, la modification et l'ajout d'évenement ?
      </p>
      <div className="flex gap-2">
        <SecondaryButton>Retour aux bébés</SecondaryButton>
        <PrimaryButton onClick={async () => {
          const result = await share({to: shareTo})
          if (result.error) {
            toast.error(result.error.message)
          } else if(!result.data?.share) {
            toast.error("Une erreur est survenue")
          } else {
            toast.success("Accès partagé")
            navigate('/babies')
          }
        }} disabled={fetching}>Partager</PrimaryButton>
      </div>
    </div>
  )
}

const SHARE_MUTATION = /* GraphQL */ `
  mutation share($to: uuid!) {
    share: insert_shares_one(object: {to_user_id: $to}) {
      id
    }
  }
`

export function ShareModal({close}) {
  const user = useCurrentUser()
  const [{data}] = useQuery({
    query: /* GraphQL */ `
      query list_shares($userId: uuid!) {
        user: users_by_pk(id: $userId) {
          id
          sharing {
            id, to { id, username }
          }
          shared {
            id, by { id, username }
          }
        }
      }
    `,
    variables: {userId: user.id}
  })
  
  const shareRequestLink = `https://a-table-api.caprover.cocaud.dev/share-to/${user.id}`
  
  return (
    <Modal title="Partager" onCloseRequested={close}>
      <div className="text-center flex flex-col gap-2">
        <p>Vous pouvez partager l'accès, la modification et l'ajout d'évenement de vos bébés aux autres utilisateurs.</p>
        <p>Pour demander le partage à un autre utilisateur, envoyez lui le lien ci-dessous :</p>
        <span className="text-blue-500 cursor-pointer" onClick={async () => {
          await navigator.clipboard.writeText(shareRequestLink)
          toast.success("Lien copié dans le presse-papier")
        }}>{shareRequestLink}</span>
        <hr className="mt-4 mb-4"/>
        <p>Vous partagez avec :</p>
        <ul>
          {data?.user?.sharing?.length === 0 && <li><Small>Aucun utilisateur</Small></li>}
          {data?.user?.sharing?.map(({to: {username, id}}) => (
            <li key={id}><strong className="font-bold">{username}</strong> <Small>({id})</Small></li>
          ))}
        </ul>
        <p>Ils partagent avec vous :</p>
        <ul>
          {data?.user?.shared?.length === 0 && <li><Small>Aucun utilisateur</Small></li>}
          {data?.user?.shared?.map(({by: {username, id}}) => (
            <li key={id}><strong className="font-bold">{username}</strong> <Small>({id})</Small></li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
