import {useState} from "react";
import {useMutation, useQuery} from "urql";
import {Card} from '../components/card';
import {toast} from "react-toastify";
import {Modal} from "../components/modal";
import {Input} from "../components/input";
import {FloatingButton} from "../components/button";
import {Header} from "../components/header";
import {Small} from "../components/text";
import {AddEventModal} from "../components/add-event-modal";
import {LogoutButton} from "../components/logout";

export function BabyChoiceScreen() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updatingBaby, setUpdatingBaby] = useState(null);
  const [addingEvent, setAddingEvent] = useState(null);
  const [{data}] = useQuery({query: LIST_BABIES_QUERY})
  
  return (
    <>
      <Header className="flex justify-between items-center">
        <div>Baby Tracker</div>
        <LogoutButton className="justify-self-end" />
      </Header>
      
      {data?.babies?.map(baby => (
        <Card to={`/babies/${baby.id}/tracker`} key={baby.id}>
          <Card.Body>
            <Card.Title>{baby.name}</Card.Title>
            
            <div className="text-center">75<Small>ml il y a</Small> 2h10</div>
            <div className="flex gap-2 items-center justify-around mt-4 text-sm">
              <div>600<Small> ml</Small></div>
              <div>2 <Small> biberons</Small></div>
              <div>75<Small> ml moy.</Small></div>
            </div>
            <div className="flex gap-2 items-center justify-around mb-2 text-sm">
              <div>600<Small> g</Small></div>
              <div>2 <Small> pots</Small></div>
              <div>75<Small> g moy.</Small></div>
            </div>
          </Card.Body>
          <Card.Actions>
            <Card.Action onClick={() => setUpdatingBaby(baby)}>✏️ Renommer</Card.Action>
            <Card.Action onClick={() => setAddingEvent(baby)}>＋ Événement</Card.Action>
          </Card.Actions>
        </Card>
      ))}
      
      
      {createModalOpen && <CreateModal close={() => setCreateModalOpen(false)}/>}
      {updatingBaby && <RenameModal baby={updatingBaby} close={() => setUpdatingBaby(null)}/>}
      {addingEvent && <AddEventModal baby={addingEvent} close={() => setAddingEvent(null)}/>}
      
      <FloatingButton onClick={() => setCreateModalOpen(true)}>＋</FloatingButton>
    </>
  )
}

function CreateModal({close}) {
  const [{fetching}, createBaby] = useMutation(CREATE_BABY_MUTATION);
  
  async function onCreateBaby(form, close) {
    const {error} = await createBaby({name: form.name.value.trim()});
    if (error) toast.error(error.message);
    else {
      toast.success(`Bébé ${form.name.value} ajouté`);
      close();
    }
  }
  
  return (
    <Modal
      title="Ajouter un bébé"
      okLabel="Ajouter" loading={fetching}
      onCloseRequested={close}
      onSubmit={onCreateBaby}
    >
      <Input name="name" placeholder="Nom de votre bébé" required/>
    </Modal>
  )
}

function RenameModal({close, baby: {id, name}}) {
  const [{fetching}, updateBaby] = useMutation(UPDATE_BABY_MUTATION);
  
  async function onUpdateBaby(form) {
    const {error} = await updateBaby({name: form.name.value.trim(), id});
    if (error) toast.error(error.message);
    else {
      toast.success(`Bébé ${name} renommé en ${form.name.value}`);
      close();
    }
  }
  
  return (
    <Modal
      title={`Renommer ${name}`}
      okLabel="Renommer" loading={fetching}
      onCloseRequested={close}
      onSubmit={onUpdateBaby}
    >
      <Input name="name" placeholder="Nom de votre bébé" required/>
    </Modal>
  )
}

const CREATE_BABY_MUTATION = /* GraphQL */ `
  mutation createBaby($name: String!) {
    insert_babies_one(object: {name: $name}) {
      id
    }
  }
`

const UPDATE_BABY_MUTATION = /* GraphQL */ `
  mutation updateBaby($name: String!, $id: uuid!) {
    update_babies_by_pk(_set: {name: $name}, pk_columns: {id: $id}) {
      id, name
    }
  }
`


const LIST_BABIES_QUERY = /* GraphQL */ `
  query listBabies {
    babies {
      id, name
    }
  }
`
