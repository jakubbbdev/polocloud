import {Card, CardContent} from '@/components/ui/card';

interface AppearanceTabProps {
}

export function AppearanceTab({}: AppearanceTabProps) {

    return (
        <div className="space-y-6">
            <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <span className="text-amber-600 text-lg">🚧</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-amber-600">
                                Feature in Development
                            </h3>
                            <p className="text-amber-600/80 text-sm mt-1">
                                The appearance customization features are currently being developed.
                                Theme switching and other visual options will be available soon!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}
