"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';

// Define the structure for user profile data
interface UserProfile {
  name: string;
  age: number | null;
  gender: string;
  height: number | null; // Consider storing in a consistent unit, e.g., cm or inches
  weight: number | string | null; // Allow string for "I don't know"
  goal: string;
}

// Define props for the component, including a callback for when onboarding is complete
interface OnboardingFormProps {
  onComplete: () => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: null,
    gender: '',
    height: null,
    weight: null,
    goal: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useMetric, setUseMetric] = useState(true); // State for unit preference

  const totalSteps = 6; // Name, Age/Gender, Height, Weight, Goal, Confirmation

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || (name === 'weight' && value !== "I don't know") ? Number(value) || null : value,
    }));
  };

  const handleRadioChange = (name: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWeightOptionChange = (value: string) => {
    if (value === "I don't know") {
      setFormData(prev => ({ ...prev, weight: "I don't know" }));
    } else {
      // If switching back from "I don't know", clear it or set to a number input
      if (formData.weight === "I don't know") {
        setFormData(prev => ({ ...prev, weight: null }));
      }
      // The actual number input is handled by handleInputChange
    }
  };


  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Submitting:', formData);

    // Simulate API call or saving process
    setTimeout(() => {
      try {
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(formData));
        localStorage.setItem('onboardingComplete', 'true');
        console.log('Saved to localStorage');
        setIsSubmitting(false);
        setIsSubmitted(true);

        // Trigger confetti or success animation here if desired

        // Call the onComplete callback after a short delay to show success state
        setTimeout(() => {
          onComplete();
        }, 1500); // Delay to show checkmark

      } catch (error) {
        console.error("Failed to save onboarding data:", error);
        setIsSubmitting(false);
        // Handle error state (e.g., show a toast message)
      }
    }, 1000); // Simulate network delay
  };

  // Animation variants for steps
  const stepVariants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 300 : -300, // Slide in from right, out to left
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeInOut' }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? 300 : -300, // Slide out to right, in from left
      transition: { duration: 0.5, ease: 'easeInOut' }
    })
  };

  // Simple background animation (can be replaced with particles, beams etc.)
  const backgroundVariants = {
    initial: { background: 'linear-gradient(to bottom right, #f0f4f8, #d9e2ec)' }, // Light theme example
    animate: {
      background: [
        'linear-gradient(to bottom right, #f0f4f8, #d9e2ec)',
        'linear-gradient(to bottom right, #e6eaf0, #d1d9e3)',
        'linear-gradient(to bottom right, #f0f4f8, #d9e2ec)',
      ],
      transition: { duration: 10, repeat: Infinity, ease: "linear" }
    }
  };
   // TODO: Add dark theme variant based on next-themes

  const renderStepContent = () => {
    const direction = 1; // Assuming forward navigation for simplicity in this example
    return (
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
        >
          {step === 1 && (
            <div className="space-y-4">
              <Label htmlFor="name" className="text-lg font-medium">What's your name?</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
              />
            </div>
          )}
          {step === 2 && (
             <div className="space-y-6">
                <div>
                    <Label htmlFor="age" className="text-lg font-medium">How old are you?</Label>
                    <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="Enter your age"
                        value={formData.age ?? ''}
                        onChange={handleInputChange}
                        className="mt-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
                    />
                </div>
                 <div>
                    <Label className="text-lg font-medium block mb-2">What's your gender?</Label>
                    <RadioGroup
                        name="gender"
                        value={formData.gender}
                        onValueChange={(value) => handleRadioChange('gender', value)}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                        <Label htmlFor="prefer_not_to_say">Prefer not to say</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <Label htmlFor="height" className="text-lg font-medium">What's your height?</Label>
              {/* Add unit toggle (cm/ft+in) here if desired */}
              <Input
                id="height"
                name="height"
                type="number"
                placeholder={`Enter height ${useMetric ? '(cm)' : '(inches)'}`}
                value={formData.height ?? ''}
                onChange={handleInputChange}
                className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
              />
               {/* Basic Unit Toggle Example */}
               <div className="flex items-center space-x-2 pt-2">
                 <Label htmlFor="unit-toggle">Use Metric (cm/kg)</Label>
                 <input
                    type="checkbox"
                    id="unit-toggle"
                    checked={useMetric}
                    onChange={(e) => setUseMetric(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                 />
               </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
                <Label htmlFor="weight" className="text-lg font-medium">What's your current weight?</Label>
                 <RadioGroup
                    defaultValue={formData.weight === "I don't know" ? "I don't know" : "enter"}
                    onValueChange={handleWeightOptionChange}
                    className="flex space-x-4 mb-2"
                 >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enter" id="enter-weight" />
                        <Label htmlFor="enter-weight">Enter Weight</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="I don't know" id="unknown-weight" />
                        <Label htmlFor="unknown-weight">I don't know</Label>
                    </div>
                </RadioGroup>
                {formData.weight !== "I don't know" && (
                    <Input
                        id="weight"
                        name="weight"
                        type="number"
                        placeholder={`Enter weight ${useMetric ? '(kg)' : '(lbs)'}`}
                        value={typeof formData.weight === 'number' ? formData.weight : ''}
                        onChange={handleInputChange}
                        className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
                        disabled={formData.weight === "I don't know"}
                    />
                )}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <Label htmlFor="goal" className="text-lg font-medium">What's your main fitness goal?</Label>
              <Select name="goal" value={formData.goal} onValueChange={(value) => handleSelectChange('goal', value)}>
                <SelectTrigger className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow">
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain Muscle / Bulk</SelectItem>
                  <SelectItem value="improve_fitness">Improve General Fitness</SelectItem>
                  <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                  <SelectItem value="increase_strength">Increase Strength</SelectItem>
                  <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
           {step === totalSteps && (
             <div className="text-center space-y-4">
                {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">Saving your profile...</p>
                    </div>
                ) : isSubmitted ? (
                     <div className="flex flex-col items-center justify-center space-y-2">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                             <Check className="h-16 w-16 text-green-500" />
                        </motion.div>
                        <p className="text-lg font-medium text-green-600">Profile Saved!</p>
                        <p className="text-muted-foreground">Redirecting you to the app...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold">Ready to Go?</h2>
                        <p className="text-muted-foreground">Review your details and let's get started!</p>
                        {/* Optionally display a summary of formData here */}
                         <Button
                            onClick={handleSubmit}
                            className="w-full group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
                            disabled={isSubmitting || isSubmitted}
                        >
                            Finish Setup
                            <Check className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                    </>
                )}
             </div>
           )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        // variants={backgroundVariants} // Apply background animation here if desired
        // initial="initial"
        // animate="animate"
        className="relative w-full max-w-md p-6 sm:p-8 bg-card text-card-foreground rounded-xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Progress Indicator */}
        <div className="mb-6 w-full">
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">Step {step} of {totalSteps}</p>
        </div>

        {/* Form Content Area */}
        <div className="min-h-[200px] flex items-center justify-center">
             {renderStepContent()}
        </div>


        {/* Navigation Buttons */}
        {step !== totalSteps && !isSubmitted && !isSubmitting && (
          <div className="mt-8 flex justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={step === 1}
              className="group transition-transform transform hover:scale-105 disabled:opacity-50"
            >
               <ArrowLeft className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="group bg-primary text-primary-foreground hover:bg-primary/90 transition-transform transform hover:scale-105"
            >
              {step === totalSteps - 1 ? 'Review' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        )}
         {/* Show only back button on final confirmation step before submitting */}
         {step === totalSteps && !isSubmitted && !isSubmitting && (
             <div className="mt-8 flex justify-start">
                 <Button
                    onClick={prevStep}
                    variant="outline"
                    className="group transition-transform transform hover:scale-105"
                    >
                    <ArrowLeft className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    Back to Edit
                </Button>
             </div>
         )}
      </motion.div>
    </motion.div>
  );
};

export default OnboardingForm;