import {Modal} from "./modal";
import {useState} from "react";
import {addMinutes, format, subMinutes} from "date-fns";
import {client} from "../graphql-client";
import cn from "classnames";
import {Input, Select} from "./input";
import {toast} from "react-toastify";

export function AddEventModal({close, baby: {id, name}}) {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => {
    return format(getDatePast10MinutesStep5(), "yyyy-MM-dd'T'HH:mm")
  })
  
  const {Form, height = "0", mutate} = types.find(({type}) => type === selectedType) ?? {};
  
  return (
    <Modal
      title={`Ajouter un événement pour ${name}`}
      okLabel="Ajouter"
      onCloseRequested={close}
      onSubmit={async (form, close) => {
        try {
          setLoading(true)
          const result = await mutate(form, {babyId: id, date: new Date(date)});
          
          if (result.error) {
            toast.error(`Impossible d'ajouter l'évenement: ${result.error.message}`);
          } else {
            toast.success('Événement ajouté');
            close()
          }
        } finally {
          setLoading(false)
        }
      }}
      loading={loading}
      disabled={!selectedType}
    >
      <input type="datetime-local" name="date" className="block m-auto text-lg mb-4" value={date}
             onChange={e => setDate(e.target.value)}/>
      
      <div className="grid grid-cols-2 grid-rows-2 w-3/4 m-auto gap-2 pb-4">
        {types.map(({icon, label, type}) => (
          <div key={type}
               className={cn(
                 "aspect-square shadow p-2 flex items-center flex-col gap-2 justify-center cursor-pointer",
                 selectedType === type ? 'bg-gray-100 ring-2' : 'hover:bg-gray-50',
               )}
               onClick={() => setSelectedType(type)}
          >
            <div className="text-6xl">{icon}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>
      
      <div className="w-3/4 m-auto transition-all" style={{height}}>
        {Form && <Form/>}
      </div>
    </Modal>
  )
}

const types = [
  {
    icon: "🍼", label: "Biberon", type: 'meal', Form: MealForm, height: "58px", mutate: (form, variables) => {
      return client.mutation(
        /* GraphQL */ `
          mutation addMeal($babyId: uuid!, $date: timestamptz!, $quantity: Int!) {
            insert_meals_one(object: {baby_id: $babyId, date: $date, quantity: $quantity}) { id }
          }
        `,
        {...variables, quantity: form.quantity.value}
      ).toPromise()
    }
  },
  {
    icon: "🥣", label: "Petit pot", type: 'puree', Form: PureeForm, height: "116px", mutate: (form, variables) => {
      return client.mutation(
        /* GraphQL */ `
          mutation addPuree($babyId: uuid!, $date: timestamptz!, $quantity: Int!, $name: String!) {
            insert_purees_one(object: {baby_id: $babyId, date: $date, quantity: $quantity, name: $name}) { id }
          }
        `,
        {...variables, quantity: form.quantity.value, name: form.name.value}
      ).toPromise()
    }
  },
  {
    icon: "💩", label: "Celle", type: 'poop', Form: PoopForm, height: "57px", mutate: (form, variables) => {
      return client.mutation(
        /* GraphQL */ `
          mutation addPoop($babyId: uuid!, $date: timestamptz!, $quantity: String!) {
            insert_poops_one(object: {baby_id: $babyId, date: $date, quantity: $quantity}) { id }
          }
        `,
        {...variables, quantity: form.quantity.value}
      ).toPromise()
    },
  },
  {
    icon: "💊",
    label: "Médicament",
    type: 'medication',
    Form: MedicationForm,
    height: "58px",
    mutate: (form, variables) => {
      return client.mutation(
        /* GraphQL */ `
          mutation addMedication($babyId: uuid!, $date: timestamptz!, $medication: String!) {
            insert_medications_one(object: {baby_id: $babyId, date: $date, medication: $medication}) { id }
          }
        `,
        {...variables, medication: form.medication.value}
      ).toPromise()
    },
  },
]

function MealForm() {
  return (
    <Input name="quantity" type="number" placeholder="Quantité" required/>
  )
}

function PoopForm() {
  return (
    <Select name="quantity" required defaultValue="++">
      <option value="traces">Traces</option>
      <option value="+">+</option>
      <option value="++">++</option>
      <option value="+++">+++</option>
    </Select>
  )
}

function PureeForm() {
  return (
    <>
      <Input name="name" placeholder="Purée" required/>
      <Input name="quantity" type="number" placeholder="Quantité" required/>
    </>
  )
}

function MedicationForm() {
  return (
    <Input name="medication" placeholder="Médicament" required/>
  )
}

function getDatePast10MinutesStep5() {
  const date = subMinutes(new Date(), 10)
  const min = date.getMinutes()
  return addMinutes(date, Math.round(min / 5) * 5 - min)
}
