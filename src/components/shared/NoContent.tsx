import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX2 } from "lucide-react";
import { cn } from "../lib/utils";


interface NoContentProps {
  message?: string;
  className?: string;
}

const NoContent: React.FC<NoContentProps> = ({
  message = "No content available",
  className,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className={cn("max-w-md w-full mx-4", className)}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileX2 className="w-16 h-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Nothing to Show
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoContent;