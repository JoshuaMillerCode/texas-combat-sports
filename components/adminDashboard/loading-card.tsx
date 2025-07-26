import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent } from "../ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export function LoadingCard() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading...</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ErrorCard() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data. Please try again later.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 