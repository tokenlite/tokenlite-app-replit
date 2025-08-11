import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Code, FileDown } from "lucide-react";

interface PreviewPanelProps {
  currentStep: number;
  generationProgress: number;
  isGenerating: boolean;
  generatedLitepaper: any;
}

const generationSteps = [
  { name: "Executive Summary", completed: false },
  { name: "Problem Statement", completed: false },
  { name: "Market Analysis", completed: false },
  { name: "Solution Overview", completed: false },
  { name: "Product Features", completed: false },
  { name: "Tokenomics", completed: false },
  { name: "Token Distribution", completed: false },
  { name: "Emission Schedule", completed: false },
  { name: "Value Growth", completed: false },
  { name: "Final Review", completed: false },
];

export function PreviewPanel({
  currentStep,
  generationProgress,
  isGenerating,
  generatedLitepaper
}: PreviewPanelProps) {
  const [contentStyle, setContentStyle] = useState("professional");
  const [documentLength, setDocumentLength] = useState("standard");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [generateTokenomicsVisuals, setGenerateTokenomicsVisuals] = useState(true);

  const { data: recentGenerations } = useQuery({
    queryKey: ["/api/litepapers/recent"],
    enabled: !isGenerating,
  });

  const getCompletedSteps = () => {
    const completed = Math.floor((generationProgress / 100) * generationSteps.length);
    return generationSteps.map((step, index) => ({
      ...step,
      completed: index < completed,
      inProgress: index === completed && isGenerating,
    }));
  };

  const handleDownload = async (format: string) => {
    if (!generatedLitepaper) return;
    
    try {
      const response = await fetch(`/api/litepapers/${generatedLitepaper.id}/download?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${generatedLitepaper.projectName}-litepaper.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Status</CardTitle>
        </CardHeader>
        <CardContent>
          {!isGenerating && currentStep === 1 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-600 mb-2">Ready to generate</p>
              <p className="text-sm text-gray-400">Fill out the form and click generate</p>
            </div>
          ) : isGenerating ? (
            <div className="space-y-4">
              {getCompletedSteps().map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-100'
                      : step.inProgress
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}>
                    {step.completed ? (
                      <i className="fas fa-check text-green-600 text-xs"></i>
                    ) : step.inProgress ? (
                      <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    ) : (
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.completed || step.inProgress ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>
              <p className="text-gray-600 mb-2">Generation Complete</p>
              <p className="text-sm text-gray-400">Your litepaper is ready for download</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <div className="w-32 h-40 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              {generatedLitepaper ? (
                <FileText className="text-primary-500 w-12 h-12" />
              ) : (
                <i className="fas fa-file-alt text-gray-400 text-3xl"></i>
              )}
            </div>
            {generatedLitepaper ? (
              <>
                <p className="text-gray-600 text-sm mb-2">{generatedLitepaper.projectName} Litepaper</p>
                <p className="text-gray-400 text-xs">Ready for download</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-2">Preview will appear here</p>
                <p className="text-gray-400 text-xs">After generation completes</p>
              </>
            )}
          </div>

          {/* Download Options */}
          {generatedLitepaper && (
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => handleDownload('pdf')}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={() => handleDownload('html')}
                variant="outline"
                className="w-full"
              >
                <Code className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
              <Button
                onClick={() => handleDownload('markdown')}
                variant="outline"
                className="w-full"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download Markdown
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Style</label>
            <Select value={contentStyle} onValueChange={setContentStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="investor-focused">Investor-focused</SelectItem>
                <SelectItem value="community-friendly">Community-friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Length</label>
            <Select value={documentLength} onValueChange={setDocumentLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive (15-20 pages)</SelectItem>
                <SelectItem value="standard">Standard (10-15 pages)</SelectItem>
                <SelectItem value="concise">Concise (8-12 pages)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <span className="text-sm text-gray-700">Include charts & diagrams</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={generateTokenomicsVisuals}
                onCheckedChange={(checked) => setGenerateTokenomicsVisuals(checked === true)}
              />
              <span className="text-sm text-gray-700">Generate tokenomics visuals</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentGenerations && recentGenerations.length > 0 ? (
              recentGenerations.map((generation: any) => (
                <div key={generation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-primary-600 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{generation.projectName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(generation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload('pdf')}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">No recent generations</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
