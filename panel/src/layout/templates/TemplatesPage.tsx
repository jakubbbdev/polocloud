import { useState, useEffect } from 'react';
import { useBreadcrumbPage } from '@/components/system/breadcrumb/hook/useBreadcrumbPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Server, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { templatesApi } from '@/lib/api/clients/templates/TemplatesApiClient';
import { Template } from '@/lib/api/types';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [editTemplateName, setEditTemplateName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useBreadcrumbPage({
        items: [
            { label: 'Templates', href: '/templates', activeHref: '/templates' }
        ]
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTemplates(filtered);
        }
    }, [searchTerm, templates]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const result = await templatesApi.getTemplates();
            if (result.success && result.data) {
                setTemplates(result.data);
                setFilteredTemplates(result.data);
            } else {
                console.error('Failed to fetch templates:', result.message);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleDeleteClick = (template: Template) => {
        setTemplateToDelete(template);
        setDeleteModalOpen(true);
        setDeleteConfirmation('');
    };

    const handleDeleteConfirm = async () => {
        if (!templateToDelete || deleteConfirmation !== templateToDelete.name) return;

        try {
            setIsDeleting(true);
            const result = await templatesApi.deleteTemplate(templateToDelete.name);

            if (result.success) {
                setTemplates(prev => prev.filter(t => t.name !== templateToDelete.name));
                setFilteredTemplates(prev => prev.filter(t => t.name !== templateToDelete.name));

                setDeleteModalOpen(false);
                setTemplateToDelete(null);
                setDeleteConfirmation('');
            } else {
                console.error('Failed to delete template:', result.message);
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setTemplateToDelete(null);
        setDeleteConfirmation('');
    };

    const handleCreateClick = () => {
        setCreateModalOpen(true);
        setNewTemplateName('');
    };

    const handleCreateConfirm = async () => {
        if (!newTemplateName.trim()) return;

        try {
            setIsCreating(true);
            const result = await templatesApi.createTemplate({ name: newTemplateName.trim() });

            if (result.success && result.data) {
                const newTemplate: Template = {
                    name: result.data.name || newTemplateName.trim(),
                    size: result.data.size !== undefined ? result.data.size : 0.0
                };

                setTemplates(prev => [...prev, newTemplate]);
                setFilteredTemplates(prev => [...prev, newTemplate]);

                setCreateModalOpen(false);
                setNewTemplateName('');
            } else {
                console.error('Failed to create template:', result.message);
            }
        } catch (error) {
            console.error('Failed to create template:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateCancel = () => {
        setCreateModalOpen(false);
        setNewTemplateName('');
    };

    const handleEditClick = (template: Template) => {
        setEditingTemplate(template);
        setEditTemplateName(template.name);
        setEditModalOpen(true);
    };

    const handleEditConfirm = async () => {
        if (!editingTemplate || !editTemplateName.trim() || editTemplateName.trim() === editingTemplate.name) return;

        try {
            setIsEditing(true);
            const result = await templatesApi.editTemplate(editingTemplate.name, { name: editTemplateName.trim() });

            if (result.success && result.data) {
                const updatedTemplate = { ...editingTemplate, name: editTemplateName.trim() };
                setTemplates(prev => prev.map(t => t.name === editingTemplate.name ? updatedTemplate : t));
                setFilteredTemplates(prev => prev.map(t => t.name === editingTemplate.name ? updatedTemplate : t));

                setEditModalOpen(false);
                setEditingTemplate(null);
                setEditTemplateName('');
            } else {
                console.error('Failed to edit template:', result.message);
            }
        } catch (error) {
            console.error('Failed to edit template:', error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleEditCancel = () => {
        setEditModalOpen(false);
        setEditingTemplate(null);
        setEditTemplateName('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading templates...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Templates</h1>
                    <p className="text-muted-foreground">
                        Manage your server templates and configurations
                    </p>
                </div>
                <Button onClick={handleCreateClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                </Button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template, index) => (
                    <motion.div
                        key={`${template.name}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {template.name}
                                    </CardTitle>
                                    <Server className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Size:</span>
                                        <Badge variant="secondary">{template.size !== undefined && template.size !== null ? `${template.size.toFixed(1)} MB` : 'Unknown'}</Badge>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditClick(template)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteClick(template)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Create your first template to get started.'}
                    </p>
                </div>
            )}

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Template</DialogTitle>
                        <DialogDescription>
                            Enter a name for the new template. Template names should be descriptive and unique.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                Template Name
                            </label>
                            <Input
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                placeholder="Enter template name"
                                className="mt-2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTemplateName.trim()) {
                                        handleCreateConfirm();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCreateCancel}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateConfirm}
                            disabled={!newTemplateName.trim() || isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Template</DialogTitle>
                        <DialogDescription>
                            Change the name of the template "{editingTemplate?.name}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                Template Name
                            </label>
                            <Input
                                value={editTemplateName}
                                onChange={(e) => setEditTemplateName(e.target.value)}
                                placeholder="Enter new template name"
                                className="mt-2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editTemplateName.trim() && editTemplateName.trim() !== editingTemplate?.name) {
                                        handleEditConfirm();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleEditCancel}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditConfirm}
                            disabled={!editTemplateName.trim() || editTemplateName.trim() === editingTemplate?.name || isEditing}
                        >
                            {isEditing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                Type the template name to confirm: <span className="font-bold">{templateToDelete?.name}</span>
                            </label>
                            <Input
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Enter template name to confirm"
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDeleteCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleteConfirmation !== templateToDelete?.name || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
