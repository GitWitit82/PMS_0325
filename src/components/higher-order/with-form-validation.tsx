"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type DefaultValues } from "react-hook-form"
import * as z from "zod"

interface WithFormValidationProps<T extends z.ZodType> {
  schema: T
  defaultValues?: DefaultValues<z.infer<T>>
  onSubmit: (data: z.infer<T>) => Promise<void>
}

/**
 * HOC to add form validation capabilities
 * @param Component - Component to wrap
 */
export function withFormValidation<T extends z.ZodType>(
  WrappedComponent: React.ComponentType<{
    form: ReturnType<typeof useForm<z.infer<T>>>
    onSubmit: (data: z.infer<T>) => Promise<void>
  }>
) {
  return function WithFormValidation(props: WithFormValidationProps<T>) {
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