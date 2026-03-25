import { createFileRoute } from '@tanstack/react-router'
import React, { use, useState } from 'react'
import VendorHeader from '@/vendors/header'
import AddVendor from '@/vendors/add'
import { useForm } from '@tanstack/react-form'
export const Route = createFileRoute('/_authenticated/_admin/vendors/')({
    head: () => ({
        title: "Manage Vendors ",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage vendors. Add, edit, or remove vendors from the system.",
        },
        {
            property: 'og:title',
            content: 'Manage Vendors',
        },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const [openNewVendorModal, setOpenNewVendorModal] = useState(false)


    const createVendorForm = useForm({
        defaultValues: {
            username: '',
            firstName: '',
            lastName: '',
            contactEmail: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
        }
    })
    return (
        <React.Fragment>
            <VendorHeader setOpenNewVendorModal={setOpenNewVendorModal} />
            <AddVendor open={openNewVendorModal} onOpenChange={setOpenNewVendorModal} form={createVendorForm} />
        </React.Fragment>
    )
}
