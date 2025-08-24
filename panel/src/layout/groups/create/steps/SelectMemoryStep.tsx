import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {CreateGroupObject} from '@/layout/groups/create/CreateGroupLayout';
import {SetupStepProps} from '@/layout/groups/create/CreateGroupLayout';
import {cn} from '@/lib/utils';
import {useState} from 'react';

const memoryOptions = [512, 1024, 2048, 4096];

export const SelectMemoryStep: React.FC<SetupStepProps<CreateGroupObject>> = ({
                                                                                  onNext,
                                                                                  isOnFocus,
                                                                                  object,
                                                                                  setObject,
                                                                              }) => {
    const [customMaxMemory, setCustomMaxMemory] = useState('');
    const [customMinMemory, setCustomMinMemory] = useState('');

    const handleMaxMemorySelect = (memory: number) => {
        setCustomMaxMemory('');
        let newMinMemory = object.minMemory || 0;

        if (memory < newMinMemory) {
            newMinMemory = Math.max(0, memory - 512);
        }

        setObject({
            ...object,
            maxMemory: memory,
            minMemory: newMinMemory
        });

        if (newMinMemory !== object.minMemory) {
            setCustomMinMemory('');
        }
    };

    const handleMinMemorySelect = (memory: number) => {
        if (memory <= object.maxMemory) {
            setCustomMinMemory('');
            setObject({...object, minMemory: memory});
        }
    };

    const handleCustomMaxMemoryChange = (value: string) => {
        setCustomMaxMemory(value);
        const memory = parseInt(value);
        if (memory >= 256 && memory <= 32768) {
            let newMinMemory = object.minMemory || 0;

            if (memory < newMinMemory) {
                newMinMemory = Math.max(0, memory - 512);
            }

            setObject({
                ...object,
                maxMemory: memory,
                minMemory: newMinMemory
            });

            if (newMinMemory !== object.minMemory) {
                setCustomMinMemory('');
            }
        }
    };

    const handleCustomMinMemoryChange = (value: string) => {
        setCustomMinMemory(value);
        const memory = parseInt(value);
        if (memory >= 0 && memory <= object.maxMemory) {
            setObject({...object, minMemory: memory});
        }
    };

    const isValidConfiguration = object.maxMemory > 0 &&
        (object.minMemory === undefined || object.minMemory === null ||
            (object.minMemory >= 0 && object.minMemory <= object.maxMemory));

    return (
        <Card
            className={`transition-all ${
                !isOnFocus ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
            <CardHeader>
                <CardTitle>Memory Configuration</CardTitle>
                <CardDescription>Configure the memory allocation for your Group.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Minimum Memory</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {memoryOptions.map((memory) => {
                            const isDisabled = memory > object.maxMemory;
                            const isSelected = object.minMemory === memory;

                            return (
                                <div
                                    key={memory}
                                    onClick={() => !isDisabled && handleMinMemorySelect(memory)}
                                    className={cn(
                                        'p-4 border-2 rounded-xl items-center justify-center flex flex-col transition-all duration-300',
                                        isDisabled
                                            ? 'opacity-40 cursor-not-allowed border-border/30 bg-muted/20'
                                            : isSelected
                                                ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20 cursor-pointer hover:scale-[1.02] hover:shadow-lg'
                                                : 'border-border/60 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md cursor-pointer hover:scale-[1.02] hover:shadow-lg'
                                    )}
                                >
                  <span className={cn(
                      "font-bold text-xl mb-1",
                      isDisabled ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {memory}
                  </span>
                                    <span className={cn(
                                        "text-sm",
                                        isDisabled ? "text-muted-foreground" : "text-muted-foreground"
                                    )}>
                    MB
                  </span>
                                    {isDisabled && (
                                        <span className="text-xs text-red-500 mt-1">Too high</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Custom Minimum Memory</Label>
                        <Input
                            type="number"
                            placeholder="Enter custom min memory in MB (0 - max memory)"
                            value={customMinMemory}
                            onChange={(e) => handleCustomMinMemoryChange(e.target.value)}
                            min="0"
                            max={object.maxMemory || 32768}
                            className="h-12 text-center text-lg font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold">Maximum Memory</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {memoryOptions.map((memory) => (
                            <div
                                key={memory}
                                onClick={() => handleMaxMemorySelect(memory)}
                                className={cn(
                                    'p-4 border-2 rounded-xl items-center justify-center flex flex-col cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                                    object.maxMemory === memory
                                        ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                                        : 'border-border/60 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md'
                                )}
                            >
                                <span className="font-bold text-xl mb-1">{memory}</span>
                                <span className="text-sm text-muted-foreground">MB</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Custom Maximum Memory</Label>
                        <Input
                            type="number"
                            placeholder="Enter custom max memory in MB (256 - 32768)"
                            value={customMaxMemory}
                            onChange={(e) => handleCustomMaxMemoryChange(e.target.value)}
                            min="256"
                            max="32768"
                            className="h-12 text-center text-lg font-medium"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button
                    disabled={!isValidConfiguration || !isOnFocus}
                    onClick={onNext}
                >
                    Continue
                </Button>
                {!isValidConfiguration && object.maxMemory > 0 && (
                    <p className="text-sm text-red-500 mt-2">
                        ⚠️ Minimum memory cannot be greater than maximum memory
                    </p>
                )}
            </CardFooter>
        </Card>
    );
};
