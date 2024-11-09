import { UseFormReturn } from "react-hook-form"
import { EditEmployeeValues } from "./schema"

export interface FormStepProps {
    form: UseFormReturn<EditEmployeeValues>
}