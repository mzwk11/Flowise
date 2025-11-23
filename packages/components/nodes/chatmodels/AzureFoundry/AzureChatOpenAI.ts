import { BaseCache } from '@langchain/core/caches'
import { ChatOpenAI as LcChatOpenAI } from '@langchain/openai'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'

class ChatAzureAIFoundry extends LcChatOpenAI {
    id: string
    configuredModel: string
    configuredMaxTokens?: number

    constructor(id: string, fields: any) {
        super(fields)
        this.id = id
        this.configuredModel = fields?.model ?? ''
        this.configuredMaxTokens = fields?.maxTokens
    }
}

class AzureAIFoundry_ChatModels implements INode {
    label: string
    name: string
    version: number
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'ChatAzureAIFoundry'
        this.name = 'chatAzureAIFoundry'
        this.version = 1.1
        this.type = 'ChatAzureAIFoundry'
        this.icon = 'Azure.svg'
        this.category = 'Chat Models'
        this.description =
            'Azure AI Foundry Models endpoint (OpenAI-compatible chat completions, np. DeepSeek, Phi, Mistral, GPT)'
        this.baseClasses = [this.type, ...getBaseClasses(ChatAzureAIFoundry)]

        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['azureAIFoundryApi'],
            optional: false,
            description: 'Azure AI Foundry endpoint (https://<resource>.services.ai.azure.com/models) + API key'
        }

        this.inputs = [
            {
                label: 'Cache',
                name: 'cache',
                type: 'BaseCache',
                optional: true
            },
            {
                label: 'Model Name',
                name: 'model',
                type: 'string',
                placeholder: 'deepseek-r1 / phi-4 / mistral-large-2411 / gpt-4.1-mini',
                description: 'Nazwa / ID modelu (deploymentu) w Azure AI Foundry – użytkownik wpisuje ręcznie.'
            },
            {
                label: 'Temperature',
                name: 'temperature',
                type: 'number',
                step: 0.1,
                default: 0.7,
                optional: true
            },
            {
                label: 'Max Output Tokens',
                name: 'maxTokens',
                type: 'number',
                step: 1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top P',
                name: 'topP',
                type: 'number',
                step: 0.1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                type: 'number',
                step: 1,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Streaming',
                name: 'streaming',
                type: 'boolean',
                default: true,
                optional: true,
                additionalParams: true
            },
            {
                label: 'API Version',
                name: 'apiVersion',
                type: 'string',
                placeholder: '2024-08-01-preview',
                description:
                    'Jeśli zostawisz puste, node użyje domyślnej wersji z backendu. Wpisz wersję, której wymaga Twój endpoint.',
                additionalParams: true,
                optional: true
            },
            {
                label: 'Allow Image Inputs',
                name: 'allowImageInputs',
                type: 'boolean',
                default: false,
                description:
                    'Umożliwia przekazywanie obrazów (image_url/base64) w wiadomościach – model musi wspierać obraz.',
                additionalParams: true,
                optional: true
            }
        ]
    }

    // eslint/prettier lubi taki prosty, pusty loadMethods
    //@ts-ignore
    loadMethods = {
        async listModels(): Promise<INodeOptionsValue[]> {
            return []
        }
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const temperature = nodeData.inputs?.temperature as string
        const model = nodeData.inputs?.model as string
        const maxTokens = nodeData.inputs?.maxTokens as string
        const topP = nodeData.inputs?.topP as string
        const topK = nodeData.inputs?.topK as string
        const streaming = nodeData.inputs?.streaming as boolean
        const cache = nodeData.inputs?.cache as BaseCache
        const apiVersion = nodeData.inputs?.apiVersion as string
        const allowImageInputs = nodeData.inputs?.allowImageInputs as boolean

        if (!model) throw new Error('Model name is required')

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)

        let endpoint = getCredentialParam('azureAIFoundryEndpoint', credentialData, nodeData) as string
        const apiKey = getCredentialParam('azureAIFoundryApiKey', credentialData, nodeData) as string

        if (!endpoint) throw new Error('Azure AI Foundry endpoint is not set')
        if (!apiKey) throw new Error('Azure AI Foundry API key is not set')

        endpoint = endpoint.trim()
        if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1)

        if (!endpoint.endsWith('/models')) {
            throw new Error(`Azure AI Foundry endpoint should end with /models, got: ${endpoint}`)
        }

        const baseURL = apiVersion
            ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}api-version=${apiVersion}`
            : endpoint

        const llmConfig: any = {
            model,
            temperature: temperature ? parseFloat(temperature) : 0.7,
            streaming: streaming ?? true,
            apiKey,
            configuration: {
                baseURL,
                defaultHeaders: {
                    'api-key': apiKey
                }
            }
        }

        if (maxTokens) llmConfig.maxTokens = parseInt(maxTokens, 10)
        if (topP) llmConfig.topP = parseFloat(topP)
        if (topK) llmConfig.topK = parseInt(topK, 10)
        if (cache) llmConfig.cache = cache
        if (allowImageInputs) llmConfig._allowImageInputs = true

        const modelInstance = new ChatAzureAIFoundry(nodeData.id, llmConfig)
        return modelInstance
    }
}

module.exports = { nodeClass: AzureAIFoundry_ChatModels }
