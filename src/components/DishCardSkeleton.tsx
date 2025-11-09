import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const DishCardSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-16" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
