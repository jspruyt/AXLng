export class YamlHelper {

    public static splitDocuments(yamlDoc: string, maxNum?: number): string[] {
        const docs: string[] = [];
        let i = 0;
        let docStart = yamlDoc.indexOf('---');

        while (docStart >= 0 && i < maxNum || docStart >= 0 && !maxNum) {
            const docEnd = yamlDoc.indexOf('...');
            if (docEnd < 0) {
                docs[i] = yamlDoc;
                break;
            }

            docs[i++] = yamlDoc.substring(docStart, docEnd + 3);
            if (maxNum && i >= maxNum ) {
                break;
            }

            yamlDoc = yamlDoc.slice(docEnd + 3);
            docStart = yamlDoc.indexOf('---');
        }
        return docs;
    }

}
