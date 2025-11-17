/**
 * CRUD 相关类型定义
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'image'
  | 'file'
  | 'richtext'
  | 'password'
  | 'select'

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: Array<{ label: string; value: unknown }>
  placeholder?: string
  rows?: number
  component?: string
  hidden?: boolean
  readonly?: boolean
}

export interface ColumnLabelMap {
  [key: string]: string
}

export interface FieldTypeMap {
  [key: string]: FieldType
}

export interface CrudModuleConfig {
  moduleKey: string
  title: string
  fields?: FieldConfig[]
  columnLabelMap?: ColumnLabelMap
  fieldTypeMap?: FieldTypeMap
  hiddenColumns?: string[]
  defaultPageSize?: number
}

