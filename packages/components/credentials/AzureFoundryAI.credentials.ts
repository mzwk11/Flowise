import { INodeParams, INodeCredential } from '../src/Interface'

class AzureAIFoundryApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Azure AI Foundry API'
        this.name = 'azureAIFoundryApi'
        this.version = 1.0
        this.description =
            'Use Azure AI Foundry Model Inference endpoint.'
        this.inputs = [
            {
                label: 'Azure AI Foundry Endpoint',
                name: 'azureAIFoundryEndpoint',
                type: 'string',
                placeholder: 'https://<resource>.services.ai.azure.com/models',
                description:
                    'Copy the endpoint from Azure AI Foundry (Models + endpoints → your deployment → Get endpoint). ' +
                    'If the URL has extra path after /models, remove it so it ends with /models.'
            },
            {
                label: 'Azure AI Foundry API Key',
                name: 'azureAIFoundryApiKey',
                type: 'password',
                description:
                    'Copy the key shown next to the endpoint in Azure AI Foundry. ' +
                    'This is the value used as AZURE_AI_CREDENTIAL / AZURE_INFERENCE_CREDENTIAL.'
            }
        ]
    }
}

module.exports = { credClass: AzureAIFoundryApi }
