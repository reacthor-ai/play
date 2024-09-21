import Link from 'next/link'
import {AlertCircle} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {NAVIGATION} from "@/utils/navigation/routes";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px] text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2 text-3xl font-bold">
            <AlertCircle className="w-8 h-8 text-destructive"/>
            <span>404</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold">Page Not Found</p>
          <p className="mt-2 text-muted-foreground">We could not find the page your looking for.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={NAVIGATION.Dashboard.Games}>Return to Games List</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}