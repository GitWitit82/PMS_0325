"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface WithFormValidationProps<T extends z.ZodType> {
  schema: T
  onSubmit: (data: z.infer<T>) => void | Promise<void>
  defaultValues?: Partial<z.infer<T>>
}

/**
 * HOC to add form validation capabilities
 * @param Component - Component to wrap
 */
export function withFormValidation<
  T extends z.ZodType,
  P extends WithFormValidationProps<T>
>(WrappedComponent: React.ComponentType<P>) {
  return function WithFormValidation(props: P) {
    const form = useForm<z.infer<T>>({
      resolver: zodResolver(props.schema),
      defaultValues: props.defaultValues,
    })

    const handleSubmit = async (data: z.infer<T>) => {
      try {
        await props.onSubmit(data)
        form.reset()
      } catch (error) {
        console.error("Form submission error:", error)
      }
    }

    return (
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <WrappedComponent {...props} form={form} />
      </form>
    )
  }
} 