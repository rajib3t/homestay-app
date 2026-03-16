import React from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <React.Fragment>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(',')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </React.Fragment>
  )
}

export default FieldInfo