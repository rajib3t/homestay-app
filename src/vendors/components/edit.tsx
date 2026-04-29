import type { UserData } from "@/types/user";
import React from "react";

interface EditVendorProps {
    data: UserData
}

const EditVendor: React.FC<EditVendorProps> = ({ data }) => {
    return (
        <React.Fragment>
            <h1 className="text-2xl font-bold mb-4">Edit Vendor</h1>
            <p>First Name: {data.first_name}</p>
            <p>Last Name: {data.last_name}</p>
            <p>Email: {data.email}</p>
            {/* Add more fields as necessary */}
        </React.Fragment>
    );
}

export default EditVendor;