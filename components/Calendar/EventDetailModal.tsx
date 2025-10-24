'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { X, Edit2, Trash2, MapPin, Tag, Calendar, Clock, Share2, Download, Copy } from 'lucide-react'
import { EventData } from '@/types'
import { saveEvent, deleteEvent } from '@/utils/indexeddb-storage'
import EnhancedEditModal from './EnhancedEditModal'

interface EventDetailModalProps {
  event: EventData
  tags: any
  onClose: () => void
  onSave: () => void
}

export default function EventDetailModal({ event, tags, onClose, onSave }: EventDetailModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteEvent(event.date)
      onSave()
      onClose()
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleShare = async () => {
    const shareText = `${event.name}\n📅 ${format(new Date(event.date), 'yyyy年MM月dd日')}\n📍 ${event.place}, ${event.city}\n🏷️ ${event.type.join('、')}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareText
        })
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        alert('事件信息已复制到剪贴板')
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  const handleExport = () => {
    const eventData = {
      ...event,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(eventData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.name}_${event.date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <h2 className="text-2xl font-bold" style={{ color: event.color }}>
                    {event.name}
                  </h2>
                </div>
                <div className="text-gray-600">
                  {format(new Date(event.date), 'yyyy年MM月dd日')}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Event Details */}
            <div className="space-y-4">
              {/* Type Tags */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <Tag size={16} className="mr-1" />
                  类型标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.type.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: tags.type?.[type] || '#ccc' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <MapPin size={16} className="mr-1" />
                  地点信息
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">{event.place}</div>
                  <div className="text-gray-600">{event.city}</div>
                </div>
              </div>

              {/* Date and Time */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  日期时间
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-900">
                    {format(new Date(event.date), 'yyyy年MM月dd日 EEEE')}
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">颜色标识</h3>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-gray-700">{event.color}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={16} />
                  <span>编辑</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>删除</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 size={16} />
                  <span>分享</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download size={16} />
                  <span>导出</span>
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Clock size={16} className="mr-1" />
                事件信息
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">事件ID:</span>
                  <span className="ml-2 text-gray-900 font-mono">{event.date}</span>
                </div>
                <div>
                  <span className="text-gray-500">标签数量:</span>
                  <span className="ml-2 text-gray-900">{event.type.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EnhancedEditModal
          event={event}
          tags={tags}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false)
            onSave()
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">删除事件</h3>
                <p className="text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="font-medium">{event.name}</div>
              <div className="text-sm text-gray-600">
                {format(new Date(event.date), 'yyyy年MM月dd日')} · {event.place}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
