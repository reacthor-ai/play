'use client'

import React, {Dispatch, SetStateAction, useState} from 'react'
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {X} from "lucide-react"
import {CreateGameParams, useCreateGameAtom} from '@/store/game/create'
import type {Category} from '@thor/db'
import {useGetGameQuery} from "@/store/game/get";

interface GameCreatorFormProps {
  onClose: Dispatch<SetStateAction<boolean>>
  userId: string
  existingCategories: {
    category: Category[]
  }
}

const MAX_POINTS = 10;
const MIN_PLAYERS = 2

export function CreateGame({onClose, userId, existingCategories}: GameCreatorFormProps) {
  const [gameConfig, setGameConfig] = useState<Omit<CreateGameParams, 'categoryId' | 'createdById' | 'name' | 'description' | 'existingCategoryId'>>({
    prompt: '',
    duration: 3,
    maxPlayers: 2,
    title: '',
    points: 0
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('new')
  const [newCategory, setNewCategory] = useState<{ name: string; description: string }>({name: '', description: ''})
  const [formError, setFormError] = useState<string | null>(null)

  const [{mutate: createGame, error, isPending}] = useCreateGameAtom()
  const { config } = useGetGameQuery()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    if (gameConfig.points > MAX_POINTS) {
      setFormError(`Points cannot exceed ${MAX_POINTS}`)
      return
    }

    const isNewCategory = selectedCategory === 'new' && existingCategories.category?.length <= 0

    const gameData: CreateGameParams = {
      ...gameConfig,
      createdById: userId,
      name: isNewCategory ? newCategory.name : '',
      description: isNewCategory ? newCategory.description : '',
      existingCategoryId: isNewCategory ? '' : selectedCategory,
    }

    try {
      await createGame(gameData, {
        onSettled: (data) => {
          if (data && data.status === 'fulfilled') {
            onClose(false)
            config!.refetch()
          }
          if (data && data.status === 'rejected') {
            setFormError("Failed to create game. Please try again.")
          }
        }
      })
    } catch (error) {
      console.error('Failed to create game:', error)
      setFormError("An unexpected error occurred. Please try again.")
    }
  }

  const handleDurationChange = (value: string) => {
    setGameConfig({...gameConfig, duration: parseInt(value, 10)})
  }

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'maxPlayers' | 'points'
  ) => {
    const value = e.target.value;

    if (value === '' || /^-*\d+$/.test(value)) {
      const minusCount = (value.match(/-/g) || []).length;
      let numValue = parseInt(value.replace(/-/g, ''), 10);
      numValue = minusCount % 2 === 1 ? -numValue : numValue;

      if (field === 'points') {
        numValue = Math.min(Math.max(numValue, 0), MAX_POINTS);
      } else if (field === 'maxPlayers') {
        numValue = Math.max(numValue, MIN_PLAYERS);
      }

      setGameConfig((prevConfig) => ({
        ...prevConfig,
        [field]: value === '' ? undefined : numValue
      }));
    }
  };

  const isDisabled = () => {
    return (
      !gameConfig.prompt.trim() ||
      !gameConfig.title.trim() ||
      (selectedCategory === 'new' ? !newCategory.description.trim() || !newCategory.name.trim() : false)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#090d21] rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={() => onClose((prev) => !prev)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={24}/>
        </button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-white">task</Label>
              <Input
                id="prompt"
                className="bg-[#1c2333] border-gray-700 text-white placeholder-gray-400"
                placeholder="your task. example: create the airbnb dashboard"
                value={gameConfig.prompt}
                onChange={(e) => setGameConfig({...gameConfig, prompt: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points" className="text-white">Points</Label>
              <Input
                id="points"
                className="bg-[#1c2333] border-gray-700 text-white placeholder-gray-400"
                type="number"
                placeholder="Enter points to be awarded"
                value={gameConfig.points}
                onChange={(e) => handleNumberChange(e, 'points')}
                required
                inputMode='numeric'
                pattern="-?[0-9]*"
                max={MAX_POINTS}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                className="bg-[#1c2333] border-gray-700 text-white placeholder-gray-400"
                placeholder="Enter game title"
                value={gameConfig.title}
                onChange={(e) => setGameConfig({...gameConfig, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Duration</Label>
              <Select onValueChange={handleDurationChange} defaultValue={gameConfig.duration.toString()}>
                <SelectTrigger className="bg-[#1c2333] border-gray-700 text-white">
                  <SelectValue placeholder="Select duration"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            {
              existingCategories.category?.length >= 1 && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select onValueChange={setSelectedCategory} defaultValue="new">
                    <SelectTrigger className="bg-[#1c2333] border-gray-700 text-white">
                      <SelectValue placeholder="Select category"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Category</SelectItem>
                      {existingCategories.category?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            }
            {selectedCategory === 'new' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">New Category Name</Label>
                  <Input
                    id="name"
                    className="bg-[#1c2333] border-gray-700 text-white placeholder-gray-400"
                    placeholder="Enter new category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">New Category Description</Label>
                  <Textarea
                    id="description"
                    className="bg-[#1c2333] border-gray-700 text-white placeholder-gray-400"
                    placeholder="Enter new category description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    required
                  />
                </div>
              </>
            )}
          </div>
          {formError && <p className="text-red-500">{formError}</p>}
          {(error as any) && <p className="text-red-500">{error as string}</p>}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending || isDisabled()}>
            {isPending ? 'Creating...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}