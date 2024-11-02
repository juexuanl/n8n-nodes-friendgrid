import {
    IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
    IRequestOptions
} from 'n8n-workflow';


export class FriendGrid implements INodeType {
	description: INodeTypeDescription = {
        displayName: 'FriendGrid',
        name: 'friendGrid',
        icon: 'file:friendGrid.svg',
        group: ['transform'],
        version: 1,
        description: 'Consume SendGrid API',
        defaults: {
            name: 'FriendGrid',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'friendGridApi',
                required: true,
            },
        ],
		properties: [
			{
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Contact',
                        value: 'contact',
                    },
                ],
                default: 'contact',
                noDataExpression: true,
                required: true,
                description: 'Create a new contact',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'contact',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Create',
                        value: 'create',
                        description: 'Create a contact',
                        action: 'Create a contact',
                    },
                ],
                default: 'create',
                noDataExpression: true,
            },
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'contact',
                        ],
                    },
                },
                default:'',
                placeholder: 'name@email.com',
                description:'Primary email for the contact',
            },
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Handle data coming from previous nodes
        const items = this.getInputData();
        let responseData;
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        // For each item, make an API call to create a contact
        for (let i = 0; i < items.length; i++) {
            if (resource === 'contact') {
                if (operation === 'create') {
                    // Get email input
                    const email = this.getNodeParameter('email', i) as string;
                    // Get additional fields input
                    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                    const data: IDataObject = {
                        email,
                    };

                    Object.assign(data, additionalFields);

                    // Make HTTP request according to https://sendgrid.com/docs/api-reference/
                    const options: IRequestOptions = {
                        headers: {
                            'Accept': 'application/json',
                        },
                        method: 'PUT',
                        body: {
                            contacts: [
                                data,
                            ],
                        },
                        uri: `https://api.sendgrid.com/v3/marketing/contacts`,
                        json: true,
                    };
                    responseData = await this.helpers.requestWithAuthentication.call(this, 'friendGridApi', options);
                    returnData.push(responseData);
                }
            }
        }
        // Map data to n8n data structure
        return [this.helpers.returnJsonArray(returnData)];
	}
}