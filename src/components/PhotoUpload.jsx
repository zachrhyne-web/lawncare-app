import { useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { Camera, Trash2, Upload } from 'lucide-react'

export default function PhotoUpload({ photos = [], onAdd, onDelete }) {
  const beforeRef = useRef(null)
  const afterRef  = useRef(null)

  const handleFile = (label, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      onAdd({
        id: uuid(),
        label,
        dataUrl: e.target.result,
        uploadedAt: new Date().toISOString(),
      })
    }
    reader.readAsDataURL(file)
  }

  const beforePhotos = photos.filter(p => p.label === 'before')
  const afterPhotos  = photos.filter(p => p.label === 'after')

  const PhotoGroup = ({ label, inputRef, items }) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700 capitalize">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-ghost text-xs py-1 px-2 border border-gray-200"
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { handleFile(label, e.target.files[0]); e.target.value = '' }}
        />
      </div>

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl
                     flex flex-col items-center justify-center gap-1
                     text-gray-400 text-xs hover:border-lime hover:text-lime transition-colors"
        >
          <Camera className="w-6 h-6" />
          <span>Add {label} photo</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photo.dataUrl}
                alt={`${label} photo`}
                className="w-full h-28 object-cover"
              />
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg text-white
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-28 border-2 border-dashed border-gray-200 rounded-xl
                       flex flex-col items-center justify-center gap-1
                       text-gray-400 text-xs hover:border-lime hover:text-lime transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Add more</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex gap-4">
      <PhotoGroup label="before" inputRef={beforeRef} items={beforePhotos} />
      <PhotoGroup label="after"  inputRef={afterRef}  items={afterPhotos} />
    </div>
  )
}
