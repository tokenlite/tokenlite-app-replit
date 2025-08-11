import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertLitepaperSchema, type InsertLitepaper } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

interface GenerationFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGeneratedLitepaper: (litepaper: any) => void;
}

interface Feature {
  name: string;
  description: string;
}

export function GenerationForm({
  currentStep,
  setCurrentStep,
  isGenerating,
  setIsGenerating,
  setGenerationProgress,
  setGeneratedLitepaper
}: GenerationFormProps) {
  const [features, setFeatures] = useState<Feature[]>([{ name: "", description: "" }]);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertLitepaper>({
    resolver: zodResolver(insertLitepaperSchema),
    defaultValues: {
      projectName: "",
      tokenSymbol: "",
      description: "",
      problemStatement: "",
      targetMarket: "",
      marketSize: "",
      totalSupply: "",
      initialPrice: undefined,
      vestingPeriod: undefined,
      tokenDistribution: {
        publicSale: 30,
        team: 20,
        ecosystem: 25,
        stakingRewards: 25
      },
      features: [{ name: "", description: "" }],
      logoUrl: "",
      outputFormat: "pdf",
      contentStyle: "professional",
      documentLength: "standard",
      includeCharts: "true"
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (data: InsertLitepaper) => {
      const response = await apiRequest("POST", "/api/litepapers", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLitepaper(data);
      setCurrentStep(3);
      toast({
        title: "Litepaper Generated",
        description: "Your litepaper has been successfully generated!",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: InsertLitepaper) => {
    setIsGenerating(true);
    setCurrentStep(2);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const currentPrev = typeof prev === 'number' ? prev : 0;
        if (currentPrev >= 90) {
          clearInterval(progressInterval);
          return currentPrev;
        }
        return currentPrev + 10;
      });
    }, 1000);

    const finalData = {
      ...data,
      features,
      logoUrl
    };

    generateMutation.mutate(finalData);
  };

  const addFeature = () => {
    setFeatures([...features, { name: "", description: "" }]);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updatedFeatures = features.map((feature, i) =>
      i === index ? { ...feature, [field]: value } : feature
    );
    setFeatures(updatedFeatures);
    form.setValue("features", updatedFeatures);
  };

  const handleGetUploadParameters = async () => {
    try {
      console.log("Fetching upload parameters...");
      const response = await apiRequest("POST", "/api/objects/upload", {});
      const data = await response.json();
      console.log("Upload parameters received:", data.uploadURL ? "URL received" : "No URL");
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload parameters:", error);
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      const response = await apiRequest("PUT", "/api/logo-images", {
        logoImageURL: uploadURL,
      });
      const data = await response.json();
      setLogoUrl(data.objectPath);
      form.setValue("logoUrl", data.objectPath);
      toast({
        title: "Logo Uploaded",
        description: "Your token logo has been uploaded successfully!",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generation Progress</h2>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-primary-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="text-sm font-medium">Project Details</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-primary-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-sm font-medium">Generate</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-primary-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-sm font-medium">Download</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-info-circle text-primary-500 mr-2"></i>
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., DeFiProtocol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., DFP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Provide a brief overview of your project, its mission, and core objectives..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Logo Upload
                </label>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG or SVG (max. 5MB)</p>
                  </div>
                </ObjectUploader>
              </div>
            </CardContent>
          </Card>

          {/* Market & Problem Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-line text-primary-500 mr-2"></i>
                Market & Problem Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="problemStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Describe the key problems your project aims to solve in the current market..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Market</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target market" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="defi">DeFi</SelectItem>
                          <SelectItem value="nft">NFT/Gaming</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="payments">Payments</SelectItem>
                          <SelectItem value="privacy">Privacy</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Size (USD)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $50B+" value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tokenomics Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-coins text-primary-500 mr-2"></i>
                Tokenomics Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="totalSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Supply <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.10"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vestingPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vesting Period (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="24"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Token Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(form.watch("tokenDistribution") || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          max="100"
                          placeholder="30"
                          value={value}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value) || 0;
                            form.setValue(`tokenDistribution.${key}`, newValue);
                          }}
                          className="pr-8 text-sm"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-cogs text-primary-500 mr-2"></i>
                Product Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Feature #{index + 1}</h4>
                    {features.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Feature name"
                      value={feature.name}
                      onChange={(e) => updateFeature(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Brief description"
                      value={feature.description}
                      onChange={(e) => updateFeature(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </CardContent>
          </Card>

          {/* Output Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-file-export text-primary-500 mr-2"></i>
                Output Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="outputFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: "pdf", icon: "fas fa-file-pdf", label: "PDF", desc: "Professional document" },
                          { value: "html", icon: "fas fa-code", label: "HTML", desc: "Web-friendly format" },
                          { value: "markdown", icon: "fab fa-markdown", label: "Markdown", desc: "Developer format" }
                        ].map((format) => (
                          <label key={format.value} className="relative flex cursor-pointer">
                            <input
                              type="radio"
                              name="outputFormat"
                              value={format.value}
                              checked={field.value === format.value}
                              onChange={() => field.onChange(format.value)}
                              className="sr-only"
                            />
                            <div className={`w-full p-4 border-2 rounded-lg text-center transition-colors ${
                              field.value === format.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-400'
                            }`}>
                              <i className={`${format.icon} ${
                                field.value === format.value ? 'text-primary-600' : 'text-gray-600'
                              } text-2xl mb-2`}></i>
                              <p className={`font-medium ${
                                field.value === format.value ? 'text-primary-900' : 'text-gray-900'
                              }`}>{format.label}</p>
                              <p className={`text-xs ${
                                field.value === format.value ? 'text-primary-600' : 'text-gray-600'
                              }`}>{format.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Generating Litepaper...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-3"></i>
                    Generate AI Litepaper
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Generation typically takes 2-3 minutes
              </p>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
