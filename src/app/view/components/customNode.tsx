import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

const CustomNode = ({ id, data }: NodeProps) => {
  // console.log(id, data)
  const customData = data as any
  return (
    <>
      <div
        className={`${customData.isSelected ? 'bg-blue-300' : 'bg-gray-100 hover:bg-gray-400'} p-3 text-center rounded-md`}
        title={id}
      >
        {customData.label}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}

export default memo(CustomNode)
