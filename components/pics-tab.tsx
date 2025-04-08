"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ImageIcon, Plus, ChevronRight, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import PhotoStorage, { type ProgressPhoto } from "@/lib/photo-storage"
import DataManager from "@/lib/data-manager"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useThemeContext } from "@/components/theme-provider"
import { motion, AnimatePresence } from "framer-motion" // Import Framer Motion

export default function PicsTab() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [newPhotoCategory, setNewPhotoCategory] = useState<string>("")
  const [newPhotoNotes, setNewPhotoNotes] = useState<string>("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteInProgress, setDeleteInProgress] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const [selectedBefore, setSelectedBefore] = useState<ProgressPhoto | null>(null)
  const [selectedAfter, setSelectedAfter] = useState<ProgressPhoto | null>(null)
  const [comparisonMode, setComparisonMode] = useState<"slider" | "fade">("slider")
  const [sliderValue, setSliderValue] = useState(50)
  const [sortDirection, setSortDirection] = useState<"oldest" | "newest">("oldest")
  const { themeColor } = useThemeContext()

  // Handle timeline photo click
  const handleTimelineClick = (photo: ProgressPhoto) => {
    if (!selectedBefore || (selectedBefore && selectedAfter)) {
      // Clear selections and set as "before" photo
      setSelectedBefore(photo)
      setSelectedAfter(null)
      setSliderValue(50) // Reset slider
    } else if (!selectedAfter && selectedBefore && selectedBefore.id !== photo.id) {
      // Set as "after" photo
      setSelectedAfter(photo)
      setSliderValue(50) // Reset slider
    }
  }

  // Sort photos by date
  const sortPhotos = (direction: "oldest" | "newest") => {
    setSortDirection(direction)
    setSelectedBefore(null)
    setSelectedAfter(null)

    // The photos are already sorted in the state, we just need to update the sort direction
    // In a real implementation, you would sort the photos array here
  }
  const categories = [
    { id: "all", name: "All Photos" },
    { id: "front", name: "Front" },
    { id: "back", name: "Back" },
    { id: "side", name: "Side" },
  ]

  // Load photos from IndexedDB
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true)
        const allPhotos = await PhotoStorage.getAllPhotos()
        setPhotos(allPhotos)
      } catch (error) {
        console.error("Error loading photos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [])

  // Filter photos based on selected category
  const filteredPhotos =
    selectedCategory === "all" ? photos : photos.filter((photo) => photo.category === selectedCategory)

  // Handle photo deletion
  const handleDeletePhoto = async () => {
    if (!photoToDelete) return

    try {
      setDeleteInProgress(true)
      await PhotoStorage.deletePhoto(photoToDelete)
      // Update the state to reflect the deletion
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== photoToDelete))
      setPhotoToDelete(null)
    } catch (error) {
      console.error("Error deleting photo:", error)
    } finally {
      setDeleteInProgress(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create a preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPhoto = async () => {
    if (!newPhotoCategory || !selectedFile || !selectedImage) {
      alert("Please select a category and upload a photo")
      return
    }

    try {
      // Create thumbnail by resizing the image (in a real app)
      // For now, we'll just use the same image for both
      const imageData = selectedImage

      const newPhoto: ProgressPhoto = {
        id: DataManager.generateId(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        category: newPhotoCategory,
        thumbnail: imageData, // In a real app, you'd create a smaller version
        fullImage: imageData,
        notes: newPhotoNotes || undefined,
      }

      await PhotoStorage.addPhoto(newPhoto)
      setPhotos((prevPhotos) => [...prevPhotos, newPhoto])

      // Reset form
      setNewPhotoCategory("")
      setNewPhotoNotes("")
      setSelectedFile(null)
      setSelectedImage(null)
      setAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding photo:", error)
      alert("Failed to save photo. Please try again.")
    }
  }

  const sortPhotosOld = (order: "newest" | "oldest") => {
    const sortedPhotos = [...photos].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return order === "newest" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })

    setPhotos(sortedPhotos)
    setSelectedBefore(null)
    setSelectedAfter(null)
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Pics Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <ImageIcon className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Progress Photos</h2>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Add Photo Button */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Progress Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Photo Category</Label>
                <Select value={newPhotoCategory} onValueChange={setNewPhotoCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="side">Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Take Photo</Label>
                <div
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  {selectedImage ? (
                    <div className="relative w-full">
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Selected photo"
                        className="w-full h-auto rounded-md max-h-48 object-contain mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImage(null)
                          setSelectedFile(null)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Tap to take a photo or upload from gallery</p>
                    </>
                  )}
                </div>
                <input type="file" id="photo-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this photo..."
                  value={newPhotoNotes}
                  onChange={(e) => setNewPhotoNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleAddPhoto}
                disabled={!newPhotoCategory || !selectedImage}
              >
                Save Photo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Tabs */}
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4">
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={selectedCategory === category.id ? "bg-primary hover:bg-primary/90" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No photos in this category</p>
                <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Photo
                </Button>
              </div>
            ) : (
              /* Photo Grid */
              <div className="grid grid-cols-2 gap-3">
                {filteredPhotos.map((pic) => (
                  <Card key={pic.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <img
                          src={pic.thumbnail || "/placeholder.svg"}
                          alt={`Progress photo from ${pic.date}`}
                          className="object-cover w-full h-full"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPhotoToDelete(pic.id)
                          }}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600/80 transition-colors"
                          aria-label="Delete photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-2 flex justify-between items-center">
                        <div className="text-xs">
                          <p className="font-medium capitalize">{pic.category}</p>
                          <p className="text-muted-foreground">{pic.date}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Select Photos to Compare</h3>
                <div className="flex space-x-2">
                  <Button
                    id="sort-oldest"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => sortPhotos("oldest")}
                  >
                    Oldest First
                  </Button>
                  <Button
                    id="sort-newest"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => sortPhotos("newest")}
                  >
                    Newest First
                  </Button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No photos available for comparison</p>
                  <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Photo
                  </Button>
                </div>
              ) : (
                <div className="timeline-container flex space-x-4 overflow-x-auto pb-4 no-scrollbar -webkit-overflow-scrolling-touch horizontal-scroll">
                  {photos.map((photo, index) => (
                    <div key={index} className="flex-shrink-0 text-center cursor-pointer group">
                      <img
                        src={photo.thumbnail || "/placeholder.svg?height=150&width=150"}
                        alt={`Progress photo ${photo.date}`}
                        className={`timeline-image w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-md transition-all duration-200 ease-in-out ${
                          selectedBefore?.id === photo.id
                            ? "selected-before"
                            : selectedAfter?.id === photo.id
                              ? "selected-after"
                              : ""
                        }`}
                        onClick={() => handleTimelineClick(photo)}
                      />
                      <p className="text-xs mt-1 text-muted-foreground group-hover:text-foreground">{photo.date}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-sm text-center text-muted-foreground mt-2">
                {photos.length > 0
                  ? "Scroll horizontally. Click to select 'Before' then 'After'. Sorting clears selection."
                  : "Add photos to enable comparison features."}
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Comparison View</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Mode:</span>
                      <Switch
                        id="mode-toggle"
                        checked={comparisonMode === "fade"}
                        onCheckedChange={(checked) => setComparisonMode(checked ? "fade" : "slider")}
                      />
                      <span className="text-sm">{comparisonMode === "fade" ? "Fade" : "Slider"}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-2 text-muted-foreground text-sm">
                    <div>
                      <span className="font-medium block">
                        Before: {selectedBefore ? selectedBefore.date : "(Select Photo)"}
                      </span>
                      {selectedBefore && selectedBefore.notes && (
                        <span className="text-xs block mt-1">{selectedBefore.notes}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium block">
                        After: {selectedAfter ? selectedAfter.date : "(Select Photo)"}
                      </span>
                      {selectedAfter && selectedAfter.notes && (
                        <span className="text-xs block mt-1">{selectedAfter.notes}</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`comparison-container aspect-square max-w-xl mx-auto bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden ${
                      comparisonMode === "fade" ? "fade-mode" : ""
                    }`}
                  >
                    {/* AnimatePresence wraps the elements that will enter/exit */}
                    <AnimatePresence mode="wait">
                      {/* Before Image - Always present but animates */}
                      <motion.img
                        key={`before-${selectedBefore?.id || 'placeholder'}`} // Key changes when 'before' image changes
                        src={selectedBefore ? selectedBefore.fullImage : "/placeholder.svg?height=600&width=600"}
                        alt="Before comparison photo"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg" // Absolute positioning
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      {/* After Image - Conditionally rendered and animated */}
                      {selectedAfter && (
                        <motion.img
                          key={`after-${selectedAfter.id}`} // Key changes when 'after' image changes
                          src={selectedAfter.fullImage}
                          alt="After comparison photo"
                          className="absolute inset-0 w-full h-full object-cover rounded-lg" // Absolute positioning
                          style={{ // Apply clip-path only in slider mode
                            clipPath: comparisonMode === 'slider' ? `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)` : undefined,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: comparisonMode === 'fade' ? (sliderValue / 100) : 1 }} // Animate opacity based on fade mode/slider
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>
                    {/* Slider and Handle remain outside AnimatePresence but inside the main container */}
                    <div
                      className="comparison-handle-line"
                      style={{
                        left: `${sliderValue}%`,
                        opacity: comparisonMode === "slider" ? 1 : 0,
                      }}
                    ></div>
                    <Slider
                      className="comparison-slider"
                      min={0}
                      max={100}
                      step={1}
                      value={[sliderValue]}
                      onValueChange={(value) => setSliderValue(value[0])}
                    />
                  </div> {/* Close comparison-container */}
                 {/* Removed misplaced AnimatePresence closing tag */}

                  <div className="text-center text-sm text-muted-foreground mt-2">
                    {comparisonMode === "slider"
                      ? "Drag the slider to compare the images"
                      : "Use the slider to adjust the fade between images"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your progress photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteInProgress}
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

