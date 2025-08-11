import { useState } from "react";
import { GenerationForm } from "@/components/GenerationForm";
import { PreviewPanel } from "@/components/PreviewPanel";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLitepaper, setGeneratedLitepaper] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-contract text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Litepaper Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Professional Crypto Documentation</span>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <i className="fas fa-question-circle mr-1"></i>Help
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GenerationForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              setGenerationProgress={setGenerationProgress}
              setGeneratedLitepaper={setGeneratedLitepaper}
            />
          </div>
          <div className="lg:col-span-1">
            <PreviewPanel
              currentStep={currentStep}
              generationProgress={generationProgress}
              isGenerating={isGenerating}
              generatedLitepaper={generatedLitepaper}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">© 2024 AI Litepaper Generator</p>
              <span className="text-gray-300">|</span>
              <a href="#" className="text-sm text-gray-500 hover:text-primary-600">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-primary-600">Terms</a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Powered by OpenAI</span>
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-gray-500 text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
