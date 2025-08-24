import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackendConfig } from '@/lib/config/BackendConfig';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface BackendConfigurationProps {
    onConfigurationComplete?: () => void;
}

export function BackendConfiguration({ 
    onConfigurationComplete
}: BackendConfigurationProps) {
    const [backendURL, setBackendURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [error, setError] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        const config = BackendConfig.getInstance().getBackendConfig();
        setIsConfigured(!!config?.backendURL);
        if (config?.backendURL) {
            setBackendURL(config.backendURL);
        }
    }, []);

    const testConnection = async (url: string) => {
        setIsTesting(true);
        setError('');
        
        try {
            // Test the connection by making a simple request
            const response = await fetch(`${url}/api/v3/alive`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Connection test failed:', err);
            return false;
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (!backendURL.trim()) {
            setError('Bitte geben Sie eine Backend-URL ein.');
            return;
        }

        // Validate URL format
        try {
            new URL(backendURL);
        } catch {
            setError('Bitte geben Sie eine gültige URL ein (z.B. https://polocloud.de:8080)');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Test the connection first
            const isConnected = await testConnection(backendURL);
            
            if (isConnected) {
                // Save the configuration
                BackendConfig.getInstance().setBackendURL(backendURL);
                setIsConfigured(true);
                
                if (onConfigurationComplete) {
                    onConfigurationComplete();
                }
                
                toast.success('Backend-URL erfolgreich aktualisiert!');
            } else {
                setError('Verbindung zum Backend fehlgeschlagen. Bitte überprüfen Sie die URL und stellen Sie sicher, dass der Server läuft.');
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        BackendConfig.getInstance().clearBackendConfig();
        setIsConfigured(false);
        setBackendURL('');
        setError('');
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Backend-Konfiguration
                </CardTitle>
                <CardDescription>
                    Konfigurieren Sie die Verbindung zu Ihrem Backend-Server
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isConfigured ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Backend ist konfiguriert</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Aktuelle URL: {BackendConfig.getInstance().getBackendConfig()?.backendURL}
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={handleClear}
                            className="w-full"
                        >
                            Konfiguration zurücksetzen
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="backend-url">Backend-URL</Label>
                            <Input
                                id="backend-url"
                                type="url"
                                placeholder="http://37.114.53.223:8080"
                                value={backendURL}
                                onChange={(e) => setBackendURL(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                            />
                            <p className="text-xs text-muted-foreground">
                                Beispiel: http://37.114.53.223:8080 oder https://polocloud.de:8080
                                <br />
                                Der Pfad /polocloud wird automatisch hinzugefügt.
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button 
                            onClick={handleSave} 
                            disabled={isLoading || isTesting}
                            className="w-full"
                        >
                            {isLoading ? 'Speichern...' : isTesting ? 'Teste Verbindung...' : 'Verbindung testen & speichern'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
