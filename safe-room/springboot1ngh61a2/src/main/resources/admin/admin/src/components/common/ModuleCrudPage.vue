<template>
  <div class="module-crud-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-info">
        <p class="eyebrow">{{ crudConfig.moduleKey }}</p>
        <h2>{{ crudConfig.title }}</h2>
      </div>
      <div class="header-actions">
        <!-- 自定义头部操作插槽 -->
        <slot name="header-actions">
          <el-button
            v-if="crudConfig.enableCreate && crud.permissions.create"
            type="primary"
            @click="handleCreate"
          >
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button :loading="crud.loading" @click="crud.fetchList">
            <el-icon><RefreshRight /></el-icon>
            刷新
          </el-button>
          <el-button
            v-if="crudConfig.enableExport && crud.permissions.export"
            :loading="crud.exporting"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button
            v-if="crudConfig.enableImport && crud.permissions.import"
            :loading="crud.importing"
            @click="importFileInput.click()"
          >
            <el-icon><Upload /></el-icon>
            导入
          </el-button>
        </slot>
      </div>
    </header>

    <!-- 搜索区域 -->
    <div v-if="crudConfig.enableSearch && crudConfig.searchFields && crudConfig.searchFields.length > 0" class="search-section">
      <el-form
        :model="crud.searchForm"
        inline
        label-width="80px"
        class="search-form"
      >
        <el-form-item
          v-for="field in crudConfig.searchFields"
          :key="field.key"
          :label="field.label"
          :prop="field.key"
        >
          <component
            :is="field.component || getSearchComponentType(field.type)"
            v-model="crud.searchForm[field.key]"
            v-bind="getSearchComponentProps(field)"
            @change="handleSearchFieldChange(field)"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="crud.loading" @click="crud.handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="crud.handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 自定义过滤区域插槽 -->
    <slot name="filter-extra" />

    <!-- 错误状态 -->
    <div v-if="crud.listError" class="error-section">
      <el-result
        icon="warning"
        :title="crud.listError"
        sub-title="加载数据失败，请检查网络连接或联系管理员"
      >
        <template #extra>
          <el-button type="primary" @click="crud.fetchList">重试</el-button>
        </template>
      </el-result>
    </div>

    <!-- 数据表格 -->
    <div v-else class="table-section">
      <!-- 表格工具栏 -->
      <div v-if="showTableToolbar" class="table-toolbar">
        <div class="toolbar-left">
          <el-text v-if="crudConfig.enableSelection" type="info" class="selection-info">
            已选择 {{ crud.selectedRows.length }} 项
          </el-text>
        </div>
        <div class="toolbar-right">
          <slot name="table-toolbar" :selected-rows="crud.selectedRows">
            <el-button
              v-if="crudConfig.enableBatchDelete && crud.permissions.remove && crud.selectedRows.length > 0"
              type="danger"
              plain
              @click="crud.batchRemove"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </slot>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="crud.loading"
        :data="crud.records"
        :height="crudConfig.tableHeight"
        border
        stripe
        row-key="id"
        :default-sort="{ prop: crud.sort.prop, order: crud.sort.order === 'desc' ? 'descending' : 'ascending' }"
        @sort-change="handleSortChange"
        @selection-change="crudConfig.enableSelection ? crud.handleSelectionChange : undefined"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="crudConfig.enableSelection"
          type="selection"
          width="55"
          align="center"
        />

        <!-- 序号列 -->
        <el-table-column type="index" label="#" width="60" align="center" />

        <!-- 数据列 -->
        <el-table-column
          v-for="column in tableColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :sortable="column.sortable"
          :fixed="column.fixed"
          :align="column.align"
          :show-overflow-tooltip="column.showOverflowTooltip"
          :formatter="column.formatter"
        >
          <!-- 自定义插槽 -->
          <template v-if="column.slot" #default="scope">
            <slot :name="`table-column-${column.prop}`" v-bind="scope" />
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
          v-if="showActionsColumn"
          label="操作"
          width="200"
          fixed="right"
          align="center"
        >
          <template #default="scope">
            <slot name="table-actions" v-bind="scope">
              <el-button
                v-if="crudConfig.enableDetail && crud.permissions.view"
                text
                type="primary"
                size="small"
                @click="crud.viewDetail(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-if="crudConfig.enableUpdate && crud.permissions.update"
                text
                size="small"
                @click="crud.openForm(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="crudConfig.enableDelete && crud.permissions.remove"
                text
                type="danger"
                size="small"
                @click="crud.removeRow(scope.row)"
              >
                删除
              </el-button>
            </slot>
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <el-empty description="暂无数据">
            <el-button
              v-if="crudConfig.enableCreate && crud.permissions.create"
              type="primary"
              @click="crud.openForm()"
            >
              去新增
            </el-button>
          </el-empty>
        </template>
      </el-table>

      <!-- 分页 -->
      <div v-if="crudConfig.enablePagination" class="pagination-wrapper">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="crud.pagination.page"
          :page-size="crud.pagination.limit"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="crud.pagination.total"
          @size-change="crud.handleSizeChange"
          @current-change="crud.handlePageChange"
        />
      </div>
    </div>

    <!-- 表单对话框 -->
    <el-dialog
      v-model="crud.formVisible"
      :title="crud.isEditing ? `编辑${crudConfig.title}` : `新增${crudConfig.title}`"
      :width="crudConfig.formDialogWidth || '600px'"
      :close-on-click-modal="false"
      draggable
    >
      <el-form
        ref="formRef"
        :model="crud.formModel"
        :rules="formRules"
        label-width="100px"
        size="default"
      >
        <el-row :gutter="20">
          <el-col
            v-for="field in formFields"
            :key="field.prop"
            :span="field.span"
            :offset="field.offset"
          >
            <el-form-item
              :label="field.label"
              :prop="field.prop"
              :required="field.required"
            >
              <component
                :is="field.component"
                v-model="crud.formModel[field.prop]"
                v-bind="field.componentProps"
                @change="handleFormFieldChange(field)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <slot name="form-footer">
          <el-button @click="crud.closeForm">取消</el-button>
          <el-button
            type="primary"
            :loading="crud.submitting"
            @click="handleSubmitForm"
          >
            保存
          </el-button>
        </slot>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="crud.detailVisible"
      :title="`${crudConfig.title}详情`"
      :width="crudConfig.detailDialogWidth || '600px'"
      draggable
    >
      <slot name="detail-content" :record="crud.detailRecord">
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-for="column in tableColumns"
            :key="column.prop"
            :label="column.label"
          >
            <slot :name="`detail-field-${column.prop}`" :value="crud.detailRecord?.[column.prop]">
              {{ formatFieldValue(crud.detailRecord?.[column.prop], getFieldType(column.prop)) }}
            </slot>
          </el-descriptions-item>
        </el-descriptions>
      </slot>
    </el-dialog>

    <!-- 隐藏的文件输入框（用于导入） -->
    <input
      ref="importFileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      style="display: none"
      @change="handleImportFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, RefreshRight, Download, Upload, Search, RefreshLeft, Delete } from '@element-plus/icons-vue'
import { useCrud } from '@/composables/useCrud'
import { createTableColumns, createFormItems, formatFieldValue } from '@/utils/crudConfig'
import type { CrudPageConfig } from '@/types/crud'

// Props定义
interface Props {
  config?: CrudPageConfig
  moduleKey?: string
  title?: string
}

const props = defineProps<Props>()

// Emits定义
const emit = defineEmits<{
  'create': []
  'update': [record: any]
  'delete': [record: any]
  'view': [record: any]
  'export': []
  'import': [file: File]
}>()

// 引用
const formRef = ref()
const importFileInput = ref<HTMLInputElement>()

// 生成默认配置（向后兼容）
const crudConfig = computed<CrudPageConfig>(() => {
  if (props.config) {
    return props.config
  }

  // 向后兼容模式：从旧props生成基本配置
  return {
    moduleKey: props.moduleKey || 'unknown',
    title: props.title || '管理页面',
    apiEndpoints: {},
    columns: [],
    enableCreate: true,
    enableUpdate: true,
    enableDelete: true,
    enableSearch: false,
    enablePagination: true,
    enableSelection: false,
    enableExport: false,
    enableImport: false,
    enableDetail: false,
    enableBatchDelete: false
  }
})

// 使用CRUD组合式函数
const crud = useCrud({
  moduleKey: crudConfig.value.moduleKey,
  title: crudConfig.value.title,
  apiEndpoints: crudConfig.value.apiEndpoints,
  searchFields: crudConfig.value.searchFields,
  defaultSort: crudConfig.value.defaultSort,
  defaultPageSize: crudConfig.value.defaultPageSize,
})

// 计算属性
const tableColumns = computed(() => createTableColumns(crudConfig.value.columns))

const formFields = computed(() => {
  if (!crudConfig.value.formFields) return []
  return createFormItems(crudConfig.value.formFields)
})

const formRules = computed(() => {
  const rules: Record<string, any> = {}
  if (crudConfig.value.formFields) {
    crudConfig.value.formFields.forEach(field => {
      if (field.rules) {
        rules[field.key] = field.rules
      }
    })
  }
  return rules
})

const showTableToolbar = computed(() => crudConfig.value.enableSelection ||
         (crudConfig.value.enableBatchDelete && crud.permissions.remove))

const showActionsColumn = computed(() => crudConfig.value.enableDetail ||
         crudConfig.value.enableUpdate ||
         crudConfig.value.enableDelete)

// 组件类型获取函数
function getSearchComponentType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    text: 'el-input',
    number: 'el-input-number',
    date: 'el-date-picker',
    datetime: 'el-date-picker',
    select: 'el-select',
    boolean: 'el-select',
  }
  return typeMap[fieldType] || 'el-input'
}

function getFieldType(fieldName: string): string {
  const field = crudConfig.value.formFields?.find(f => f.key === fieldName)
  return field?.type || 'text'
}

// 组件属性获取函数
function getSearchComponentProps(field: any): Record<string, any> {
  const props: Record<string, any> = {
    placeholder: field.placeholder || `请输入${field.label}`,
    clearable: field.clearable !== false,
  }

  switch (field.type) {
    case 'number':
      props.controls = false
      break
    case 'date':
      props.type = field.dateType || 'date'
      props.format = 'YYYY-MM-DD'
      props.valueFormat = 'YYYY-MM-DD'
      break
    case 'datetime':
      props.type = field.dateType || 'datetime'
      props.format = 'YYYY-MM-DD HH:mm:ss'
      props.valueFormat = 'YYYY-MM-DD HH:mm:ss'
      break
    case 'daterange':
      props.type = 'daterange'
      props.rangeSeparator = '至'
      props.startPlaceholder = '开始日期'
      props.endPlaceholder = '结束日期'
      props.format = 'YYYY-MM-DD'
      props.valueFormat = 'YYYY-MM-DD'
      break
    case 'datetimerange':
      props.type = 'datetimerange'
      props.rangeSeparator = '至'
      props.startPlaceholder = '开始时间'
      props.endPlaceholder = '结束时间'
      props.format = 'YYYY-MM-DD HH:mm:ss'
      props.valueFormat = 'YYYY-MM-DD HH:mm:ss'
      break
    case 'select':
      if (field.multiple) {
        props.multiple = true
        props.collapseTags = true
        props.collapseTagsTooltip = true
      }
      props.filterable = field.filterable !== false
      props.placeholder = field.placeholder || `请选择${field.label}`
      break
    case 'boolean':
      props.placeholder = `请选择${field.label}`
      props.options = [
        { label: '是', value: true },
        { label: '否', value: false },
      ]
      break
  }

  return props
}

// 事件处理函数
function handleCreate() {
  crud.openForm()
  emit('create')
}

function handleExport() {
  crud.handleExport()
  emit('export')
}

function handleImportFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    crud.handleImport(file)
    emit('import', file)
  }
  // 重置input值，允许重复选择同一文件
  target.value = ''
}

async function handleSubmitForm() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    await crud.submitForm()
  } catch (error) {
    // 表单验证失败或提交失败，错误已在crud.submitForm中处理
    console.error('表单提交失败:', error)
  }
}

function handleSortChange(sorter: { prop: string; order: string }) {
  crud.handleSortChange(sorter)
}

function handleSearchFieldChange(field: any) {
  // 日期范围字段特殊处理
  if (field.type === 'daterange' || field.type === 'datetimerange') {
    // 可以在这里添加日期范围的特殊处理逻辑
  }
}

function handleFormFieldChange(field: any) {
  // 表单字段变化处理
  // 可以在这里添加字段联动逻辑
}

// 生命周期
onMounted(() => {
  crud.fetchList()
})

// 监听配置变化，重新初始化CRUD
watch(() => props.config, () => {
  // 如果配置发生变化，可能需要重新初始化
  // 这里可以添加配置变化的处理逻辑
}, { deep: true })

// 暴露方法给父组件
defineExpose({
  crud,
  refresh: crud.fetchList,
})
</script>

<style lang="scss" scoped>
.module-crud-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .header-info {
      .eyebrow {
        font-size: 12px;
        color: #a0a4b3;
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      h2 {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  // 搜索区域
  .search-section {
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .search-form {
      :deep(.el-form-item) {
        margin-bottom: 16px;
      }
    }
  }

  // 错误状态
  .error-section {
    padding: 40px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
  }

  // 表格区域
  .table-section {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    // 表格工具栏
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;
      background: #fafafa;

      .toolbar-left {
        .selection-info {
          font-size: 14px;
        }
      }

      .toolbar-right {
        display: flex;
        gap: 12px;
      }
    }

    // 表格样式覆盖
    :deep(.el-table) {
      .el-table__header-wrapper {
        .el-table__header {
          .el-table__cell {
            background: #f5f7fa;
            color: #606266;
            font-weight: 600;
          }
        }
      }

      .el-table__row {
        &:hover {
          background: #f5f7fa;
        }

        &.el-table__row--striped {
          background: #fafafa;
        }
      }
    }

    // 分页
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid #ebeef5;
      background: #fafafa;

      :deep(.el-pagination) {
        .el-pager li {
          &.is-active {
            background: #409eff;
            color: #ffffff;
          }

          &:hover {
            color: #409eff;
          }
        }
      }
    }
  }

  // 对话框样式
  :deep(.el-dialog) {
    .el-dialog__header {
      margin: 0;
      padding: 20px 20px 10px;
      border-bottom: 1px solid #ebeef5;

      .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-dialog__body {
      padding: 20px;

      // 表单样式
      .el-form {
        .el-row {
          .el-col {
            .el-form-item {
              margin-bottom: 20px;

              .el-form-item__label {
                font-weight: 500;
                color: #606266;
              }

              // 自定义组件样式
              :deep(.el-input),
              :deep(.el-select),
              :deep(.el-input-number),
              :deep(.el-date-editor),
              :deep(.el-textarea) {
                width: 100%;
              }

              // 图片上传组件样式
              :deep(.el-upload) {
                width: 100%;

                &.el-upload--picture-card {
                  width: auto;
                  margin: 0;
                }
              }

              // 富文本编辑器样式
              :deep(.ql-container) {
                min-height: 200px;
              }
            }
          }
        }
      }

      // 详情描述样式
      .el-descriptions {
        .el-descriptions__body {
          .el-descriptions-item {
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;

            .el-descriptions-item__label {
              font-weight: 500;
              color: #606266;
              width: 120px;
            }

            .el-descriptions-item__content {
              color: #303133;

              // 图片样式
              :deep(img) {
                max-width: 200px;
                max-height: 150px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
      }
    }

    .el-dialog__footer {
      padding: 10px 20px 20px;
      border-top: 1px solid #ebeef5;
      text-align: right;

      .el-button {
        margin-left: 12px;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .page-header {
      flex-direction: column;
      gap: 16px;

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .search-section {
      padding: 16px;

      .search-form {
        .el-form-item {
          display: block;
          margin-bottom: 12px;

          .el-form-item__content {
            margin-left: 0 !important;
          }
        }
      }
    }

    .table-section {
      .table-toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;

        .toolbar-left,
        .toolbar-right {
          justify-content: center;
        }
      }

      .pagination-wrapper {
        justify-content: center;
      }
    }

    :deep(.el-dialog) {
      width: 95% !important;
      margin: 5vh auto;

      .el-dialog__body {
        padding: 16px;
      }
    }
  }

  // 暗色主题支持
  @media (prefers-color-scheme: dark) {
    background: #1a1a1a;

    .page-header,
    .search-section,
    .error-section,
    .table-section {
      background: #2a2a2a;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .table-section {
      .table-toolbar {
        background: #1f1f1f;
        border-bottom-color: #404040;
      }

      .pagination-wrapper {
        background: #1f1f1f;
        border-top-color: #404040;
      }

      :deep(.el-table) {
        .el-table__header-wrapper {
          .el-table__header {
            .el-table__cell {
              background: #1f1f1f;
              color: #c0c4cc;
              border-bottom-color: #404040;
            }
          }
        }

        .el-table__row {
          &:hover {
            background: #1f1f1f;
          }

          &.el-table__row--striped {
            background: #2a2a2a;
          }

          .el-table__cell {
            border-bottom-color: #404040;
          }
        }
      }
    }

    :deep(.el-dialog) {
      .el-dialog__header {
        border-bottom-color: #404040;

        .el-dialog__title {
          color: #ffffff;
        }
      }

      .el-dialog__body {
        .el-descriptions {
          .el-descriptions__body {
            .el-descriptions-item {
              border-bottom-color: #404040;

              .el-descriptions-item__label {
                color: #c0c4cc;
              }

              .el-descriptions-item__content {
                color: #ffffff;
              }
            }
          }
        }
      }

      .el-dialog__footer {
        border-top-color: #404040;
      }
    }
  }
}

// 全局样式覆盖
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-message) {
  z-index: 9999;
}

// 自定义滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;

  &:hover {
    background: #a8a8a8;
  }
}

// 打印样式
@media print {
  .module-crud-page {
    .page-header .header-actions,
    .search-section,
    .table-section .table-toolbar,
    .table-section .pagination-wrapper {
      display: none !important;
    }

    .table-section {
      box-shadow: none;
      border: 1px solid #ddd;
    }
  }
}
</style>
