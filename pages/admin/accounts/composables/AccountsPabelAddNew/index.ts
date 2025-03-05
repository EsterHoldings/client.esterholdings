import {reactive} from "vue";

export const countriesList:any = reactive([
    {
        "value": "0052b296-7fe1-436e-9656-8f4513ec65e5",
        "text": "Afghanistan"
    },
    {
        "value": "21b156d7-735f-4a16-9c7a-63ac341352c8",
        "text": "Albania"
    },
    {
        "value": "a23f69fa-22b5-46c0-b592-cd9046f65e05",
        "text": "Algeria"
    },
    {
        "value": "254f8175-8149-41ab-b027-503285d2dd80",
        "text": "Andorra"
    },
    {
        "value": "e6145b64-d3dd-46f4-8265-3f3b4c08c016",
        "text": "Angola"
    },
    {
        "value": "3ca7b08d-503c-4856-845c-77afa905c719",
        "text": "Argentina"
    },
    {
        "value": "d5cb3a23-7dc3-4f6b-a0c3-e471a3e07dcd",
        "text": "Armenia"
    },
    {
        "value": "f7caec1a-e294-49e0-a8d2-8eed77002c99",
        "text": "Australia"
    },
    {
        "value": "ce7d1db8-b258-4dd6-b83c-d6e101d73177",
        "text": "Austria"
    },
    {
        "value": "04a3c930-62d3-4b10-a37f-f51c1ba8ecb5",
        "text": "Azerbaijan"
    },
    {
        "value": "3fe5f285-220c-480b-9f0a-b390f0ec44f3",
        "text": "Bahamas"
    },
    {
        "value": "0eb0c43b-a32a-4658-90c8-c50be8812031",
        "text": "Bahrain"
    },
    {
        "value": "0f62a543-4897-44ad-aa06-28abba592463",
        "text": "Bangladesh"
    },
    {
        "value": "71db1ee5-7f01-4cd3-8300-e5966acc1988",
        "text": "Barbados"
    },
    {
        "value": "6ecb6f58-64f7-4b72-bf97-0b663571d5f7",
        "text": "Belarus"
    },
    {
        "value": "57ac2146-b8a0-49d3-8ee2-a8418a54ffa0",
        "text": "Belgium"
    },
    {
        "value": "df2e0d44-fcfe-42e5-b57e-952d747569db",
        "text": "Belize"
    },
    {
        "value": "a4e81bd8-5b73-4a17-b161-f1a37abe7fab",
        "text": "Benin"
    },
    {
        "value": "79e4a567-ff4d-4775-9050-d4676f18fcc6",
        "text": "Bhutan"
    },
    {
        "value": "7b1f8069-9313-41c3-a398-23e8a471e987",
        "text": "Bolivia"
    },
    {
        "value": "a244797f-742f-4deb-a15b-b13ebbb81a94",
        "text": "Bosnia and Herzegovina"
    },
    {
        "value": "6f075260-9ab0-4f82-b17b-c847e573571e",
        "text": "Botswana"
    },
    {
        "value": "d107b19e-df70-462b-9e95-6174d52ce1a1",
        "text": "Brazil"
    }
])

export const cityList:any = reactive([
    {
        "value": "4382b8cd-3d2b-42cf-b49b-50200c99d861",
        "text": "New York"
    },
    {
        "value": "9c0847d4-19b1-4c66-a775-4af54f9ccee5",
        "text": "Los Angeles"
    },
    {
        "value": "83409968-f2d9-4c7e-8982-e301778bfa3a",
        "text": "Chicago"
    },
    {
        "value": "59a844a7-573e-4c95-82ff-db291e5b4527",
        "text": "Houston"
    },
    {
        "value": "3f57c384-541e-4737-a688-cdef904aff1b",
        "text": "Phoenix"
    },
    {
        "value": "5ccf4c17-3bde-4eaf-a97e-2ca3633c41e9",
        "text": "Philadelphia"
    },
    {
        "value": "3d77abf1-878f-4541-9671-0629894fc0d3",
        "text": "San Antonio"
    },
    {
        "value": "67dc7725-ab1b-4ea6-850b-dc51bb0f7813",
        "text": "San Diego"
    },
    {
        "value": "cec44dc7-37bd-472e-9da3-058ea035845d",
        "text": "Dallas"
    },
    {
        "value": "e68b2f63-753c-4004-bbc3-f1c7c6066449",
        "text": "San Jose"
    }
])

export const formData:any = reactive({
    email: '',
    first_name: '',
    last_name: '',
    mid_name: '',
    birthdate: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postal_code: '',
    password: '',
    password_confirmation: '',
})

export const errorsFormDataObject:any = reactive({

    email: {
        isDirty: false,
        errors: []
    },
    first_name: {
        isDirty: false,
        errors: []
    },
    last_name: {
        isDirty: false,
        errors: []
    },
    mid_name: {
        isDirty: false,
        errors: []
    },
    birthdate: {
        isDirty: false,
        errors: []
    },
    phone: {
        isDirty: false,
        errors: []
    },
    country: {
        isDirty: false,
        errors: []
    },
    state: {
        isDirty: false,
        errors: []
    },
    city: {
        isDirty: false,
        errors: []
    },
    address: {
        isDirty: false,
        errors: []
    },
    postal_code: {
        isDirty: false,
        errors: []
    },
    password: {
        isDirty: false,
        errors: []
    },
    password_confirmation: {
        isDirty: false,
        errors: []
    },
})