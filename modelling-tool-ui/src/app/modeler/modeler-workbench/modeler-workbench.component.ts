import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { dia, shapes } from '@joint/core';

interface ModelField {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
  description?: string;
}

interface ModelEntity {
  id: string;
  name: string;
  color: string;
  note?: string;
  fields: ModelField[];
}

interface ModelRelationship {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  note?: string;
}

interface EntityFormState {
  name: string;
  color: string;
  note: string;
}

interface FieldFormState {
  name: string;
  type: string;
  isPrimary: boolean;
  description: string;
}

interface RelationshipFormState {
  fromId: string;
  toId: string;
  type: string;
  note: string;
}

@Component({
  selector: 'app-modeler-workbench',
  templateUrl: './modeler-workbench.component.html',
  styleUrls: ['./modeler-workbench.component.scss'],
  standalone: false,
})
export class ModelerWorkbenchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('diagramHost', { static: true }) private diagramHost!: ElementRef<HTMLDivElement>;

  readonly fieldTypeOptions = [
    'string',
    'text',
    'integer',
    'decimal',
    'boolean',
    'date',
    'datetime',
    'uuid',
    'json',
  ];

  readonly relationshipTypeOptions = ['one-to-one', 'one-to-many', 'many-to-many'];

  entities: ModelEntity[] = [];
  relationships: ModelRelationship[] = [];
  stagedFields: ModelField[] = [];
  entityForm: EntityFormState = {
    name: '',
    color: '#2563eb',
    note: '',
  };
  fieldForm: FieldFormState = {
    name: '',
    type: 'string',
    isPrimary: false,
    description: '',
  };
  relationshipForm: RelationshipFormState = {
    fromId: '',
    toId: '',
    type: 'one-to-many',
    note: '',
  };
  selectedEntityId?: string;
  formHint = '';

  private readonly namespace = shapes;
  private readonly graph = new dia.Graph({}, { cellNamespace: this.namespace });
  private paper: dia.Paper | null = null;
  private pendingDiagramInvalidation = false;
  private readonly entityPositions = new Map<string, { x: number; y: number }>();

  ngOnInit(): void {
    this.loadSampleModel();
  }

  ngAfterViewInit(): void {
    this.paper = new dia.Paper({
      cellViewNamespace: this.namespace,
      el: this.diagramHost.nativeElement,
      model: this.graph,
      async: true,
      height: this.diagramHost.nativeElement.clientHeight || 600,
      width: this.diagramHost.nativeElement.clientWidth || 900,
      gridSize: 10,
      drawGrid: { name: 'mesh', color: '#e2e8f0' },
      background: { color: '#f8fafc' },
      sorting: dia.Paper.sorting.APPROX,
      interactive: (cellView) => cellView.model.isElement() || cellView.model.isLink(),
    });

    this.paper.on('element:pointerup', (view) => {
      const position = view.model.position();
      this.entityPositions.set(view.model.id.toString(), position);
    });

    this.paper.on('element:pointerdown', (view) => {
      this.handleEntitySelection(view.model.id.toString());
    });

    if (this.pendingDiagramInvalidation) {
      this.renderDiagram();
      this.pendingDiagramInvalidation = false;
    } else {
      this.renderDiagram();
    }
  }

  ngOnDestroy(): void {
    this.paper?.remove();
  }

  @HostListener('window:resize')
  handleViewportResize(): void {
    if (!this.paper) {
      return;
    }
    const bounds = this.diagramHost.nativeElement.getBoundingClientRect();
    this.paper.setDimensions(bounds.width, bounds.height);
  }

  addField(): void {
    if (!this.fieldForm.name.trim()) {
      this.formHint = 'Field name is required.';
      return;
    }

    const field: ModelField = {
      id: this.generateId('field'),
      name: this.fieldForm.name.trim(),
      type: this.fieldForm.type,
      isPrimary: this.fieldForm.isPrimary,
      description: this.fieldForm.description.trim(),
    };

    this.stagedFields.push(field);
    this.fieldForm = { ...this.fieldForm, name: '', isPrimary: false, description: '' };
    this.formHint = '';
  }

  removeField(fieldId: string): void {
    this.stagedFields = this.stagedFields.filter((field) => field.id !== fieldId);
  }

  createEntity(): void {
    if (!this.entityForm.name.trim()) {
      this.formHint = 'Table name is required.';
      return;
    }

    const fields = this.stagedFields.length
      ? [...this.stagedFields]
      : [
          {
            id: this.generateId('field'),
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
        ];

    const entity: ModelEntity = {
      id: this.generateId('entity'),
      name: this.entityForm.name.trim(),
      color: this.entityForm.color || this.randomColor(),
      note: this.entityForm.note.trim(),
      fields,
    };

    this.entities = [...this.entities, entity];
    this.stagedFields = [];
    this.entityPositions.set(entity.id, this.computeGridPosition(this.entities.length - 1));
    this.handleEntitySelection(entity.id);
    this.entityForm = { name: '', color: this.entityForm.color, note: '' };
    this.formHint = '';
    this.invalidateDiagram();
  }

  createRelationship(): void {
    const { fromId, toId } = this.relationshipForm;
    if (!fromId || !toId || fromId === toId) {
      this.formHint = 'Choose two distinct tables to describe a relationship.';
      return;
    }

    const duplicate = this.relationships.some(
      (relation) =>
        (relation.fromId === fromId && relation.toId === toId && relation.type === this.relationshipForm.type) ||
        (relation.fromId === toId && relation.toId === fromId && relation.type === this.relationshipForm.type),
    );
    if (duplicate) {
      this.formHint = 'This relationship already exists.';
      return;
    }

    const relationship: ModelRelationship = {
      id: this.generateId('rel'),
      ...this.relationshipForm,
      note: this.relationshipForm.note.trim(),
    };

    this.relationships = [...this.relationships, relationship];
    this.relationshipForm = { fromId: '', toId: '', type: 'one-to-many', note: '' };
    this.formHint = '';
    this.invalidateDiagram();
  }

  deleteRelationship(relationshipId: string): void {
    this.relationships = this.relationships.filter((relationship) => relationship.id !== relationshipId);
    this.invalidateDiagram();
  }

  loadSampleModel(): void {
    const sample = this.buildSampleModel();
    this.entities = sample.entities;
    this.relationships = sample.relationships;
    this.selectedEntityId = undefined;
    this.entityPositions.clear();
    this.stagedFields = [];
    this.invalidateDiagram();
  }

  autoArrange(): void {
    this.entityPositions.clear();
    this.invalidateDiagram();
  }

  selectEntityFromList(entityId: string): void {
    this.handleEntitySelection(entityId);
  }

  entityName(entityId: string): string {
    return this.entities.find((entity) => entity.id === entityId)?.name ?? 'Unknown';
  }

  get selectedEntity(): ModelEntity | undefined {
    return this.entities.find((entity) => entity.id === this.selectedEntityId);
  }

  private handleEntitySelection(entityId?: string): void {
    this.selectedEntityId = entityId;
    if (!this.paper) {
      return;
    }
    this.highlightSelection();
  }

  private highlightSelection(): void {
    if (!this.paper) {
      this.pendingDiagramInvalidation = true;
      return;
    }

    this.graph.getElements().forEach((element) => {
      const isSelected = element.id.toString() === this.selectedEntityId;
      element.attr('body/stroke', isSelected ? '#f97316' : '#cbd5f5');
      element.attr('body/strokeWidth', isSelected ? 3 : 1.5);
      element.attr('body/filter', isSelected ? { name: 'dropShadow', args: { dx: 0, dy: 2, blur: 6, color: '#f9731622' } } : null);
    });
  }

  private invalidateDiagram(): void {
    if (!this.paper) {
      this.pendingDiagramInvalidation = true;
      return;
    }
    this.renderDiagram();
  }

  private renderDiagram(): void {
    const cells: dia.Cell[] = [];

    this.entities.forEach((entity, index) => {
      const height = Math.max(120, 80 + entity.fields.length * 26);
      const element = new shapes.standard.HeaderedRectangle({
        id: entity.id,
        size: { width: 260, height },
      });

      const position = this.entityPositions.get(entity.id) ?? this.computeGridPosition(index);
      element.position(position.x, position.y);
      this.entityPositions.set(entity.id, position);

      element.attr({
        header: {
          fill: entity.color,
          stroke: entity.color,
        },
        headerText: {
          text: entity.name,
          fill: '#ffffff',
          fontSize: 14,
          fontWeight: '600',
          textAnchor: 'middle',
        },
        body: {
          fill: '#ffffff',
          stroke: this.selectedEntityId === entity.id ? '#f97316' : '#cbd5f5',
          strokeWidth: this.selectedEntityId === entity.id ? 3 : 1.5,
        },
        bodyText: {
          fill: '#0f172a',
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace',
          textWrap: {
            text: this.formatFields(entity.fields),
            width: 230,
          },
        },
      });

      cells.push(element);
    });

    const links = this.relationships.map((relationship) => {
      const link = new shapes.standard.Link({
        id: relationship.id,
        source: { id: relationship.fromId },
        target: { id: relationship.toId },
        labels: [
          {
            attrs: {
              text: {
                text: relationship.type.replace(/-/g, ' '),
                fontSize: 10,
                fill: '#475569',
                letterSpacing: 0.5,
              },
              rect: {
                fill: '#ffffff',
                stroke: '#cbd5f5',
                strokeWidth: 1,
                rx: 4,
                ry: 4,
              },
            },
            position: 0.5,
          },
        ],
      });
      link.attr({
        line: {
          stroke: '#475569',
          strokeWidth: 1.5,
          targetMarker: {
            type: 'path',
            d: 'M 10 -5 0 0 10 5 z',
            fill: '#475569',
          },
          sourceMarker: {
            type: 'circle',
            r: 3,
            stroke: '#475569',
            fill: '#475569',
          },
        },
      });
      return link;
    });

    this.graph.resetCells([...cells, ...links]);
    this.highlightSelection();
    this.handleViewportResize();
  }

  private buildSampleModel(): { entities: ModelEntity[]; relationships: ModelRelationship[] } {
    const customer: ModelEntity = {
      id: this.generateId('entity'),
      name: 'Customer',
      color: '#0ea5e9',
      note: 'Stores CRM friendly profile data.',
      fields: [
        { id: this.generateId('field'), name: 'id', type: 'uuid', isPrimary: true },
        { id: this.generateId('field'), name: 'email', type: 'string', isPrimary: false },
        { id: this.generateId('field'), name: 'full_name', type: 'string', isPrimary: false },
        { id: this.generateId('field'), name: 'signup_date', type: 'date', isPrimary: false },
      ],
    };

    const order: ModelEntity = {
      id: this.generateId('entity'),
      name: 'Order',
      color: '#22c55e',
      note: 'Represents ecommerce transactions.',
      fields: [
        { id: this.generateId('field'), name: 'id', type: 'uuid', isPrimary: true },
        { id: this.generateId('field'), name: 'customer_id', type: 'uuid', isPrimary: false },
        { id: this.generateId('field'), name: 'status', type: 'string', isPrimary: false },
        { id: this.generateId('field'), name: 'created_at', type: 'datetime', isPrimary: false },
        { id: this.generateId('field'), name: 'total_amount', type: 'decimal', isPrimary: false },
      ],
    };

    const lineItem: ModelEntity = {
      id: this.generateId('entity'),
      name: 'LineItem',
      color: '#eab308',
      note: 'Individual products within an order.',
      fields: [
        { id: this.generateId('field'), name: 'id', type: 'uuid', isPrimary: true },
        { id: this.generateId('field'), name: 'order_id', type: 'uuid', isPrimary: false },
        { id: this.generateId('field'), name: 'product_id', type: 'uuid', isPrimary: false },
        { id: this.generateId('field'), name: 'quantity', type: 'integer', isPrimary: false },
        { id: this.generateId('field'), name: 'unit_price', type: 'decimal', isPrimary: false },
      ],
    };

    const product: ModelEntity = {
      id: this.generateId('entity'),
      name: 'Product',
      color: '#6366f1',
      note: 'Catalog of sellable products.',
      fields: [
        { id: this.generateId('field'), name: 'id', type: 'uuid', isPrimary: true },
        { id: this.generateId('field'), name: 'sku', type: 'string', isPrimary: false },
        { id: this.generateId('field'), name: 'name', type: 'string', isPrimary: false },
        { id: this.generateId('field'), name: 'unit_price', type: 'decimal', isPrimary: false },
      ],
    };

    const relationships: ModelRelationship[] = [
      {
        id: this.generateId('rel'),
        fromId: customer.id,
        toId: order.id,
        type: 'one-to-many',
        note: 'One customer can place multiple orders',
      },
      {
        id: this.generateId('rel'),
        fromId: order.id,
        toId: lineItem.id,
        type: 'one-to-many',
        note: 'Each order breaks down into individual line items',
      },
      {
        id: this.generateId('rel'),
        fromId: product.id,
        toId: lineItem.id,
        type: 'one-to-many',
        note: 'Products can appear in many line items',
      },
    ];

    return {
      entities: [customer, order, lineItem, product],
      relationships,
    };
  }

  private formatFields(fields: ModelField[]): string {
    if (!fields.length) {
      return 'No columns defined yet';
    }
    return fields.map((field) => `${field.isPrimary ? '[PK] ' : ''}${field.name} : ${field.type}`).join('\n');
  }

  private computeGridPosition(index: number): { x: number; y: number } {
    const hostWidth = this.diagramHost?.nativeElement?.clientWidth || 900;
    const columns = Math.max(1, Math.floor(hostWidth / 320));
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = 32 + column * 300;
    const y = 32 + row * 220;
    return { x, y };
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
  }

  private randomColor(): string {
    const palette = ['#0ea5e9', '#22c55e', '#a855f7', '#f97316', '#6366f1', '#14b8a6'];
    return palette[Math.floor(Math.random() * palette.length)];
  }
}
